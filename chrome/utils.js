var tc = {};
tc.responses = {};
tc.popD = null;

tc.urlRegExp = new RegExp(
    "^\s*(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*\s*$");

tc.urlValidate = function(url){
    return tc.urlRegExp.test(url);
}

tc.handleSeperator = ':';

tc.registerResponse = function(kind, func){
    tc.responses[kind] = func;
}

//    if(window.top === window){
chrome.extension.onMessage.addListener(
    function(request, sender, sendResponse){
	if(request.kind == 'tcPopD')
	    if(tc.popD.dialog('isOpen')){
		tc.popD.dialog('close');
	    } else {
		tc.popD.dialog('open');
	    }
    }
);

tc.onResponse = function(request){
    console.log('onResponse',request);
    tc.responses[request.kind](request);
}
tc.sendMessage = function(request){
    console.log('sendMessage',request);
    chrome.extension.sendRequest(request, tc.onResponse);
}

tc.popSend = function(){
    var url = document.baseURI;
    $("link[rel='canonical']").map(
	function(){ 
	    if(this.href)
		url = this.href;
	});
    var h = new tc.urlHandle(url);
    if(h){
	tc.sendMessage({
	    kind: h.kind
	    , handle: h.handle
	    , pop: 1
	});	    
    }	
}

tc.onLink = function(request){
    if(request.tcid.length > 0)
	$("[tcid="+request.tcid+"]").map(
	    function(){
		tc.resultPrev(this,request);
	    });
}

tc.handleExamine = function(selector,kind,getval,placer){
    tc.registerResponse('link',onLink);
    $(selector).not('[tcid],img,div').map(
	function(){
	    var target = this, href = this.href, h;
	    if(getval)
		href = getval(this);
	    if(placer)
		target = placer(this);
	    if(this != target)
		this.setAttribute('tcid',1);
	    var r = tc.random();	    
	    target.setAttribute('tcid',r);
	    if(kind && kind == 'urlfrag'){
		h = tc.fragHandle(href);
	    }else
		h = new tc.urlHandle(href);
	    if(h && h.kind != null && (kind == null || kind == 'urlfrag' || kind == h.kind)){
		tc.sendMessage({
		    kind: h.kind
		    , tcid: r
		    , handle: h.handle});
	    }
	});
}

    tc.insertPrev = function(n,icon, r,title,theDiv){
    	if(!n.previousSibling || !n.previousSibling.getAttribute || !n.previousSibling.getAttribute('subv')){ 
    	    var resDiv = $('<div>'
    			   , { id: r
    			       , subv: true
    			       , style: 'display: inline;padding-bottom: 3px;padding-left: 3px;padding-top: 3px;padding-right: 3px;' })
    		.append($('<img>', { src: icon}));
	    resDiv.insertBefore(n);
    	    n.style.display = "inline";
    	    tc.iconDialog(title,theDiv,r);
    	}
    };

    tc.popDialog = function(request){
	var d;
	var r = tc.random(), z = 'd' + r;
 	var rdc = request.data.template_data;
	var title = rdc.title, icon = rdc.icon, kind = 'result';
	var revDiv = tc.renderTemplate(request.data,r,request.data.key,rdc);
	var autoOpen = request.popD;

	if(tc.popD == null){	
	    d = $('<div>',{id:'tcPopD'})
		.append($('<div>',{id:'tcResults'}))
		.append($('<div>',{id:'tcOther'}))
		.dialog(
		    { zIndex: 100000001
		      ,title: 'thinkContext: ' + title
		      , position: [window.innerWidth - 350
				   , 10 ]
		      , close: function(){
			  $(window).unbind('resize');
			  $(window).unbind('scroll');
		      }
		      , height: 150
		      , autoOpen: false
		    });     
	    tc.popD = d;
	}
	d = tc.popD;
	switch(kind){
	case 'result':
	    $('#tcResults',d).append(revDiv);
	    break;
	default:
	    $('#tcOther',d).append(revDiv);
	}
	if(autoOpen){
	    d.dialog('open');
	}
	tc.sendMessage({kind:'pageA',icon:icon});
	$('div#' + z + ' a[tcstat]').click(function(){
	    tc.sendMessage({kind: 'sendstat'
	 		    , key: this.attributes['tcstat'].value});
	});

	$(window).scroll(function(){
	    d.dialog('close');
	});
	$(window).click(function(){
	    d.dialog('close');
	});
	d.mouseenter(function(){
	    $(window).off('click');
	});
	d.mouseleave(function(){
	    $(window).click(function(){
		d.dialog('close');
	    });
	});

	// really irritating when the dialog steals focus
	if(autoOpen){
	    document.activeElement.blur();
	}
    }

    tc.iconDialog = function(title,body,iconId){
	var d = body.dialog(
	    {autoOpen: false
	     , title:  'thinkContext: ' + title
	     , height: 150
	     , zIndex: 10000000
	    }); 
	$("div#"+iconId ).hover(
	    function(event){ 
		d.dialog('option','position',[event.clientX - 15, event.clientY - 15]); 
		d.dialog('open'); 
		$('div:has(div#d'+iconId+')').mouseleave(function(e){ d.dialog('close'); });
		return false;}
	);
	$('div#d' + iconId+' a[tcstat]').click(function(){
	    tc.sendMessage({'kind': 'sendstat'
	 		    , 'key': this.attributes['tcstat'].value});
	});
    }
    
tc.renderActions = function(request,rid){
	var detail = data.data;
	if(typeof(detail) != "object")
	    detail = {};
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = key;
	detail.url = data.url;
	detail.tcstat = rdc.tcstat;
	detail.id = data.id;
	var d = $("<div>",{id: "d"+r}).appendTo('body');
	new EJS({text: rdc.template}).update("d"+r,detail);
	return d;
	
    };

    tc.resultPrev = function(n,request){
	var r = tc.random();
	var d = tc.renderActions(request,r)

        // if(data.subtype == 'imgad'){
        //     console.log('imgad');
        //     tc.insertImgAd(n, rdc.icon, r, rdc.title, d);
        // } else {
	tc.insertPrev(n, rdc.icon, r, rdc.title, d);
	// }
    }

tc.uniqueArray = function(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};
tc.random = function(){return Math.floor(Math.random() * 100000);}

tc.fragHandle = function(frag){
    var m,h;
    frag = frag.replace(/^https?:\/\//,'');
    if(m = frag.match(/(https?:\/\/)?(\w[\w\.\-\_]+\w[\w\.\-\_\/]+)/)){
	h = new tc.urlHandle('http://' + m[2]);
	return h;
    }
}

tc.urlHandle = function(url){
    //console.log('urlHandle',url);
    url = url.trim();
    if(!url.match(/^https?:\/\/\w/))
	return null;
    this.url = url;
    var m, sp = url.split('/');
    var domain = sp[2].toLowerCase().replace(/^www\./,'');
    var path = sp.slice(3).join('/');
    this.domain = domain;
    this.path = path;
    
    if(domain == 'twitter.com' && (m = path.match('^(\w+)'))){
	this.kind = 'twitter';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'tripadvisor.com' && (m = path.match('_Review-(g[0-9]+-d[0-9]+)'))){
	this.kind = 'tripadvisor';
	this.hval = m[1];
    } else if(domain == 'facebook.com' && ((m = path.match('pages.*/([0-9]{5,20})')) || (m = path.match('^([^\?/\#]+)')))){
	this.kind = 'facebook';
	this.hval = m[1];
    } else if(domain == 'yelp.com' && (m = path.match(/biz\/([\w\-]+)/))){
	this.kind = 'yelp';
	this.hval = m[1];
    } else if(domain == 'hotels.com' && (m = path.match('ho([0-9]+)'))){
	this.kind = 'hcom';
	this.hval = m[1];
    } else if(domain == 'orbitz.com' && (m = path.match('(h[0-9]+)'))){
	this.kind = 'orbitz';
	this.hval = m[1];
    } else if(domain == 'expedia.com' && (m = path.match('(h[0-9]+)'))){
	this.kind = 'expedia';
	this.hval = m[1];
    } else if(domain == 'kayak.com' && (m = path.match('([0-9]+).ksp'))){
	this.kind = 'kayak';
	this.hval = m[1];
    } else if(domain == 'priceline.com' && (m = path.match('-([0-9]{5,10})-'))){
	this.kind = 'priceline';
	this.hval = m[1];
    } else if(domain == 'imdb.com' && (m = path.match('title/(tt[0-9]+)'))){
	this.kind = 'imdb';
	this.hval = m[1];
    } else if(domain == 'plus.google.com' && ((m = path.match('^([0-9]+)')) || (m = path.match('(\+\w+)')))){
	this.kind = 'gplus';
	this.hval = m[1];
    } else {
	this.kind = 'domain';
	this.hval = domain + '/' + path;
    }

    if(this.kind && this.hval)
	this.handle = this.kind + ':' + this.hval;
    else 
	this = null;
}
