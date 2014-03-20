var tc = {};
tc.responses = {};
tc.popD = null;
tc.defaultIcon = "";

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
    tc.registerResponse('pop',tc.onPop);
    var url = document.baseURI;
    $("link[rel='canonical']").map(
	function(){ 
	    if(this.href)
		url = this.href;
	});
    var h = new tc.urlHandle(url);
    if(h){
	tc.sendMessage({
	    kind: 'pop'
	    , handle: h.handle
	});	    
    }	
}

tc.onPop = function(request){
    console.log('onPop',request);
    var autoOpen = true;
    var dd = tc.renderResults(request.results,'tcpopd');
    var d;
    if(dd){
	d = dd.dialog;
	d.dialog({
	    title: dd.title
	    , zIndex: 100000001
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
	
	if(autoOpen){
	    d.dialog('open');
	}
	tc.sendMessage({kind:'pageA',icon:dd.icon});
	$('div#tcpopd a[tcstat]').click(function(){
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
}

tc.onLink = function(request){
    console.log('onLink',request,request.tcid);
    if(request.tcid > 0)
	$("[tcid="+request.tcid+"]").map(
	    function(){
		console.log(this);
		tc.insertPrev(this,request);
	    });
}

tc.handleExamine = function(selector,kind,getval,placer){
    tc.registerResponse('link',tc.onLink);
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
		    kind: 'link'
		    , tcid: r
		    , handle: h.handle});
	    }
	});
}

tc.insertPrev = function(n,request){
    console.log('insertPrev',request);
    var d;
    var rid = tc.random(), iid = 'i' + rid;
    var dd = tc.renderResults(request.results,rid);
    if(dd && n.previousSibling && n.previousSibling.getAttribute && n.previousSibling.getAttribute('tc')){ 
	d = dd.dialog;

    	var resDiv = $('<span>'
    		       , { id: iid
    			   , tc: 'tc'
    			   , style: 'display: inline;padding-bottom: 3px;padding-left: 3px;padding-top: 3px;padding-right: 3px;' })
    	    .append($('<img>', { src: dd.icon}));
	resDiv.insertBefore(n);
    	n.style.display = "inline";

	d.dialog(
	    {autoOpen: false
	     , title:  'thinkContext: ' + dd.title
	     , height: 150
	     , zIndex: 10000000
	    }); 
	$("#"+iid ).hover(
	    function(event){ 
		d.dialog('option','position',[event.clientX - 15, event.clientY - 15]); 
		d.dialog('open'); 
		$('div:has(#'+iid+')').mouseleave(function(e){ d.dialog('close'); });
		return false;}
	);
	$('#' + iid +' a[tcstat]').click(function(){
	    tc.sendMessage({'kind': 'sendstat'
	 		    , 'key': this.attributes['tcstat'].value});
	});
    }
};
    
tc.renderResults = function(results,rid){
    console.log('renderResults',results,rid);
    var d = $("<div>",{id: rid,tc:'tc'}).appendTo('body');
    console.log(d);
    var result, campaign, c, icon, title;
    for(var i in results){
	result = results[i];
	for(var j in result.campaigns){
	    campaign = result.campaigns[j];
	    console.log(campaign);
	    if(icon){
		icon = tc.defaultIcon;
		title = tc.defaultTitle;
	    } else {
		icon = campaign.action.icon;
		title = campaign.action.title;
	    }
	    $("<div>",{id: rid + j}).appendTo('div#' + rid);
	    new EJS({text: campaign.action.template}).update(rid + j,$.extend(campaign,campaign.action));
	}
    }
    return {title:title,icon:icon,dialog:d};
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
    console.log('urlHandle',url);
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
    console.log(this);
    if(this.kind && this.hval)
	this.handle = this.kind + ':' + this.hval;
    else 
    	return null;
}
