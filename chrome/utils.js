var tc = {};
tc.found = false;
tc.debug = 0;
tc.responses = {};
tc.popD = null;
tc.defaultIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gkSFTsC27HFFQAAAPxJREFUKM+F0r1KQ0EQBeAvcgkWYiEprKws5FZiYXELUfA5rEKwCBYpQkgh+ASWKX0XC99AEFQQbiGilSJ6UcFmhGXz48AWe2bOzsw52zIdBSpsxf0GV/i2II5Q4wf3cb7wiO480jkanKKT4GsY4wOTWZ0a7CfYMUbJvcI7eulOdXRKo44uRYIN8YQ27MVOnYxYYifDVmOywyLUe8BLVnQWjx0k2CvuUBYLFN7G+rzkUvi0Eer9FyvYDI4ifBpnRbd4y7ABnrH8B3RDwSopOske2w07+vkYk0gMQ710vEHkLmK9qeiFTw2u4zQxXj8ltWaQ2+FtmXzyS3ymRb8KQDZXemSofgAAAABJRU5ErkJggg=="; // infoI
tc.defaultTitle = "thinkContext";

tc.debug && console.log("utils",document.URL);

tc.urlRegExp = new RegExp(
    "^\s*(http|https|ftp)\://[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(:[a-zA-Z0-9]*)?/?([a-zA-Z0-9\-\._\?\,\'/\\\+&amp;%\$#\=~])*\s*$");

tc.urlValidate = function(url){
    return tc.urlRegExp.test(url);
}

tc.handleSeperator = ':';

tc.registerResponse = function(kind, func){
    tc.responses[kind] = func;
}

if(window.top === window){ // don't listen in an iframe
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
}

tc.onResponse = function(request){
    tc.debug  && console.log('onResponse',request,tc.responses);
    tc.responses[request.kind](request);
}
tc.sendMessage = function(request){
    tc.debug  && console.log('sendMessage',request);
    chrome.extension.sendRequest(request, tc.onResponse);
}

tc.popSend = function(){
    tc.registerResponse('pop',tc.onPop);
    var url = document.baseURI;
    if(document.location.pathname != '/'){
	$("link[rel='canonical']").map(
	    function(){ 
		if(this.href)
		    url = this.href;
	    });
    }
    var h = new tc.urlHandle(url);
    if(h){
	tc.sendMessage({
	    kind: 'pop'
	    , handle: h.handle
	});	    
    }	
}
tc.onPop = function(request){
    tc.debug  && console.log('onPop',request);
    var autoOpen = window.top === window ? request.popD : null; // don't open in iframe
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
    	    , closeText: 'x'
    	    , create: function() {
    	    	$(this).css("maxHeight", 300);
    	    }	    
    	    , width: 500
    	    , resizable: false
    	    , autoOpen: false
    	    , dialogClass: 'thinkcontext'
    	});     
    	tc.popD = d;
	
    	if(autoOpen){
    	    d.dialog('open');
    	}
    	tc.sendMessage({kind:'pageA',icon:dd.icon});

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

tc.onLink = function(request,spClass){
    //console.log('onLink',request,request.tcid);
    if(request.tcid > 0)
	$("[tcid="+request.tcid+"]").map(
	    function(){
		tc.insertPrev(this,request,spClass);
	    });
}

tc.handleExamine = function(selector,kind,getval,placer){
    tc.registerResponse('link',tc.onLink);
    tc.debug >= 2 && console.log('handleExamine',kind,selector);
    $(selector).not('[tcid]').filter(function(){ if(this.textContent && this.textContent.trim && this.textContent.trim().length > 0) return true }).map(
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

tc.insertPrev = function(n,request,pClass){
    tc.debug >= 2 && console.log('insertPrev',request,n);
    var d;
    var spClass = pClass || 'thinkcontext';
    var rid = tc.random(), iid = 'i' + rid;
    var dd = tc.renderResults(request.results,rid);
    if(dd && (!n.previousSibling || !n.previousSibling.getAttribute || !n.previousSibling.getAttribute('tc'))){ 
	d = dd.dialog;

	var oh = n.offsetHeight - 2;
	if(oh > 16)
	    oh = 16;
	else if(oh < 0)
	    oh = 14;
	var resDiv = $('<span>', { id: iid, tc: 'tc',class: spClass})
    	    .append($('<img>', { src: dd.icon, height: oh, width: oh }));
	resDiv.insertBefore(n);
    	//n.style.display = "inline";
	
	d.dialog(
	    {autoOpen: false
	     , title:  'thinkContext: ' + dd.title
	     , create: function() {
	      	 $(this).css("maxHeight", 300);        
	     }	    
	     , resizable: false
	     , width: 500
	     , zIndex: 10000000
	     , dialogClass: 'thinkcontext'
  	     , closeText: 'x'
	    }); 
	$("#"+iid ).hover(
	    function(event){ 
		d.dialog('option','position',[event.clientX - 15, event.clientY - 15]); 
		d.dialog('open'); 
		$('div:has(#'+iid+')').mouseout(function(e){ d.dialog('close'); });
		return false;}
	);
    }
};

tc.renderResults = function(results,rid){
    tc.debug >= 2 && console.log('renderResults',results,rid);
    var d = $("<div>"
	      ,{id: rid
		,tc:'tc'
		,class: 'thinkcontext'
		,style: "overflow-y: scroll"}	      
	     )
	.appendTo('body');
    var result, campaign, c = 0, icon, title;
    for(var i in results){
	result = results[i];
	for(var j in result.campaigns){
	    campaign = result.campaigns[j];
	    if(campaign.status == 'D' || ! campaign.action || typeof campaign.action != 'object')
		continue;
	    if(icon){
		icon = tc.defaultIcon;
		title = tc.defaultTitle;
	    } else {
		icon = campaign.action.icon;
		title = campaign.action.title;
	    }
	    if(c > 0)
		$("<hr>").appendTo('div#' + rid);
	    c = 1;	    
	    $("<div>",{id: rid + j,class: 'tc-camp'}).appendTo('div#' + rid);
	    if(campaign && campaign.action && campaign.action.template){
		new EJS({text: campaign.action.template}).update(rid + j,$.extend(campaign,campaign.action));
	    } else {
		tc.debug >= 1 && console.log("renderResults: can't render",results,campaign);
	    }
	}
    }
    if(title && icon)
	return {title:title,icon:icon,dialog:d};
}

tc.uniqueArray = function(a) {
    if(a)
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

// tc.movHandle = function(name,year){
//     tc.debug >= 2 && console.log('movHandle',name,year);
//     this.kind = 'mov';
//     if(! (name && name.length > 0 && year && year.match(/^[0-9]{4}$/))){
//       return null;
//     }
//     name = name.replace(/^the | the | the$/gi,'').toLowerCase();
//     name = name.replace(/[\s\.,-\/#!$%\^&\*;:{}=\-_`~()\[\]]/g,"");
    
//     this.handle_seperator = ':';
//     this.name = name;
//     this.year = year;
//     this.hval = name + '|' + year;
    
//     this.handle = this.kind + this.handle_seperator + this.hval;
// }

tc.urlHandle = function(url){
    if(!url)
	return null;
    url = url.trim();
    if(!url.match(/^https?:\/\/\w/))
	return null;
    this.url = url;
    var m, sp = url.split('/');
    var domain = sp[2].toLowerCase().replace(/^[w0-9]+\./,'');
    var path = sp.slice(3).join('/');
    var query = path.split('?')[1];
    this.domain = domain;
    this.path = path;
    this.query = query;
    
    if(domain == 'twitter.com' && (m = path.match(/^(\w+)/))){
	this.kind = 'twitter';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'tripadvisor.com' && (m = path.match(/_Review-(g[0-9]+-d[0-9]+)/))){
	this.kind = 'tripadvisor';
	this.hval = m[1];
    } else if(domain == 'facebook.com' && ((m = path.match(/pages.*\/([0-9]{5,20})/)) || (m = path.match(/^([^\?\/\#]+)/)))){
	this.kind = 'facebook';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'yelp.com' && (m = path.match(/biz\/([\w\-]+)/))){
	this.kind = 'yelp';
	this.hval = m[1];
    } else if(domain == 'hotels.com' && (m = path.match(/ho([0-9]+)/))){
	this.kind = 'hcom';
	this.hval = m[1];
    } else if(domain == 'orbitz.com' && (m = path.match(/(h[0-9]+)/))){
	this.kind = 'orbitz';
	this.hval = m[1];
    } else if(domain == 'expedia.com' && (m = path.match(/(h[0-9]+)/))){
	this.kind = 'expedia';
	this.hval = m[1];
    } else if(domain == 'kayak.com' && (m = path.match(/([0-9]+).ksp/))){
	this.kind = 'kayak';
	this.hval = m[1];
    } else if(domain == 'priceline.com' && (m = path.match(/-([0-9]{5,10})-/))){
	this.kind = 'priceline';
	this.hval = m[1];
    } else if(domain == 'imdb.com' && (m = path.match(/title\/(tt[0-9]+)/))){
	this.kind = 'imdb';
	this.hval = m[1];
    } else if(domain.match(/\.?netflix\.com$/) && (m = path.match(/WiMovie\/([0-9]+)/) || (query && (m = query.match(/movieid=([0-9]+)/))) || (m = path.match(/^Movie\/.*\/([0-9]+)$/)))){
	this.kind = 'netflix';
	this.hval = m[1];
    } else if(domain.match(/\.?rottentomatoes\.com$/) && (m = path.match(/m\/([^\/]+)/))){
	this.kind = 'rt';
	this.hval = m[1];
    } else if(domain == 'plus.google.com' && ((m = path.match(/^([0-9]+)/)) || (m = path.match('(\+\w+)')))){
	this.kind = 'gplus';
	this.hval = m[1];
    } else if(domain == 'en.wikipedia.org' && (m = path.match(/wiki\/([\w\-]+)/))){
	this.kind = 'wiki'
	this.hval = m[1];
    } else {
	this.kind = 'domain';
	this.hval = domain + '/' + path;
    }
    if(this.kind && this.hval)
	this.handle = this.kind + ':' + this.hval;
    else 
    	return null;
}

//for congress, names frequently appear as either
tc.stCanon = function(st){
    return st.replace(/[áéíóúÉñÑ]/g,
		      function(m){
			  return {
			      'á': 'a',
			      'é': 'e',
			      'í': 'i',
			      'ó': 'o',
			      'ú': 'u',
			      'É': 'E',
			      'ñ': 'n',
			      'Ñ': 'N'
			  }[m]
		      });
}
