if(typeof(tc) == 'undefined'){
    tc = {};
    tc.dialogs = [];
    tc.responses = {};
    tc.popD = null;

    tc.debug = function(txt){ 
	//console.log(txt); 
    }

    tc.registerResponse = function(kind, func){
	tc.responses[kind] = func;
    }

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

    tc.iconDir = chrome.extension.getURL("icons");
    tc.icons = { trackback32: tc.iconDir + "/trackback-32.png"
	       };

    tc.insertPrev = function(n,icon, r,title,theDiv){
	if(!n.previousSibling || !n.previousSibling.getAttribute || !n.previousSibling.getAttribute('subv')){ 
	    var resDiv = $('<div>'
			   , { id: r
			       , subv: true
			       , style: 'display: inline;padding-bottom: 3px;padding-left: 3px;padding-top: 3px;padding-right: 3px;' })
		.append($('<img>', { src: icon}))[0];
	    n.parentNode.insertBefore(resDiv,n);
	    n.style.display = "inline";
	    tc.iconDialog(title,theDiv,r);
	}
    };

    tc.popDialog = function(title, revDiv, z, autoOpen,icon,kind){
	var d;

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

    tc.sigURL = function(url){
	// turn a url into some sort of canonicalized version
	// unfortunately this varies by site so this will be an imperfect exercise
	var ret = url;
	var matches;
	var yt = new RegExp(/http(s)?:\/\/([^\.]+\.)?youtube.com\/watch\?.*(v=[^\&]*).*/);
	if(matches = yt.exec(ret)){
	    ret = 'http://www.youtube.com/watch?' + matches[3];
	    ret = ret.split('#')[0];	      
	} else if(ret.match(/^http(s)?:\/\/(\w*\.)*yahoo.com\//)){
	    ret = ret.split('?')[0].split('#')[0].split(';')[0];	      
	} else {
	    ret = ret.split('?')[0].split('#')[0];	      
	}
	return ret;
    }

    tc.htmlDecode = function(value){ 
	return $('<div/>').html(value).text(); 
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
	tc.dialogs.push(d);
    }

    tc.onResponse = function(request){
	tc.responses[request.kind](request);
    }

    tc.sendMessage = function(request){
	chrome.extension.sendRequest(request, tc.onResponse);
    }

    tc.closeAllDialogs = function(){
	for(var d in tc.dialogs){
	    tc.dialogs[d].dialog('close');
	}
    }

    tc.googlePlaces = function(request){ 
	var data = request.data;
	var d, icon, title, blurb, rdc, ra, tcstat = 'gsp',h;
	for(var r in data){
	    d = data[r];
	    ra = tc.random();
	    blurb = $("<div>",{id: "d"+ra}).appendTo('body');
	    rdc = JSON.parse(data.template_data);
	    h = new EJS({text: rdc.template}).render();
	    $("#d"+ra).append(h);
	    tc.googlePlacesHandler(d.siteid, rdc.icon ,ra, rdc.title ,blurb);
	}
    }

    tc.resultPop = function(request){
	var data = request.data;
	var detail = JSON.parse(data.data);
	var rdc = JSON.parse(data.template_data);
	r = tc.random();
	if(typeof(detail) != "object")
	    detail = {};
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = request.data.key;
	detail.url = data.url;
	detail.tcstat = rdc.tcstat;
	detail.id = data.id;

	var d = $("<div>",{id: "d"+r}).appendTo('body');
	new EJS({text: rdc.template}).update("d"+r,detail);
	tc.popDialog(rdc.title, d, 'd'+r,request.popD,rdc.icon,'result');    
    }

    tc.resultPrevResponse = function(request){
	$("[sid=" + request.sid +"]").map(function(){
	    tc.resultPrev(this,request.key,request.data);});
    };
    
    tc.searchLinkExam = function(selector,source,placer,getval){
	tc.registerResponse('link', tc.resultPrevResponse);
	// tc.registerResponse('yelp', tc.resultPrevResponse);
	// tc.registerResponse('tripadvisor', tc.resultPrevResponse);
	// tc.registerResponse('hcom', tc.resultPrevResponse);

	$(selector).not('[tcLink]').map(
	    function(){
		var target = this, href = this.href;
		if(getval)
		    href = getval(this);
		if(placer)
		    target = placer(this);
		this.setAttribute('tcLink','tcLink');
		var sid = "gs" + tc.random();
		target.setAttribute("sid",sid);
		var url = tc.sigURL(href).replace(/https?:\/\//,'').replace(/\/$/,'').toLowerCase();
		tc.sendMessage({kind: 'link'
				,source: source
     				, sid: sid
     				, key: url});
		// if(url.match('tripadvisor\.com')){
		//     tc.sendMessage({kind: 'tripadvisor'
		// 		    , source: source
     		// 		    , sid: sid
     		// 		    , key: tc.keyMatch.tripadvisor(url) });
		// } else if(url.match('yelp.com')){
		//     tc.sendMessage({kind: 'yelp'
		// 		    , source: source
     		// 		    , sid: sid
     		// 		    , key: tc.keyMatch.yelp(url) });	
		// } else if(url.match('facebook\.com')){
		//     tc.sendMessage({kind: 'facebook'
		// 		    , source: source
     		// 		    , sid: sid
     		// 		    , key: tc.keyMatch.facebook(url) });	
		// } else if(url.match('://(www\.)?hotels\.com')){
		//     tc.sendMessage({kind: 'hcom'
		// 		    , source: source
     		// 		    , sid: sid
     		// 		    , key: tc.keyMatch.hcom(url) });	
		// }	
	    }
	);
    };

    tc.resultPrev = function(n,key,data){
	var detail = JSON.parse(data.data);
	var rdc = JSON.parse(data.template_data);
	r = tc.random();
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

	tc.insertPrev(n
		      , rdc.icon
		      , r
		      , rdc.title
		      , d
		     );
    }

    tc.place = function(n, cid,data){
	var rdc = JSON.parse(data.template_data);
	r = tc.random();
	var d = $("<div>",{id: "d"+r}).appendTo('body');
	new EJS({text: rdc.template}).update("d"+r);
	
	tc.insertPrev(n
		      , rdc.icon
		      , r
		      , rdc.title
		      , d
		     );
    }

    tc.random = function(){return Math.floor(Math.random() * 100000);}
}
