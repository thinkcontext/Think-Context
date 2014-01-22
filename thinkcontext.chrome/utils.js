if(typeof(tc) == 'undefined'){
    tc = {};
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
	    if(request.kind == 'tcPopD'){
		console.log(tc.popD);
		var pd = tc.popD.data('overlay');
		console.log(pd);
		if(pd.isOpened()){
		    pd.close();
		} else {
		    pd.load();
		}
	    }
	}
    );

    // tc.insertImgAd = function(n,icon,r,title,theDiv){
    // 	console.log('insertImgAd',n);
    // 	var offsetLeft = n.offsetLeft, offsetTop = n.offsetTop + 10;
    // 	var resDiv = $('<div>'
    // 		       , { id: r
    // 			   , subv: true
    // 			   , style: 'display: inline;padding-bottom: 3px;padding-left: 3px;padding-top: 3px;padding-right: 3px; zIndex: 100000001' })
    // 	    .append($('<img>', { src: icon}))[0];
    // 	resDiv.style.offsetLeft = offsetLeft;
    // 	resDiv.style.offsetTop = offsetTop;
    // 	$('body').append(resDiv);

    // };

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

    tc.popDialog = function(request){
	var r = tc.random(), z = 'd' + r;
 	var rdc = JSON.parse(request.data.template_data);
	var title = rdc.title, icon = rdc.icon, kind = 'result';
	var revDiv = tc.renderTemplate(request.data,r,request.data.key,rdc);
	if(tc.popD == null){	
	    d = $('<div>',{id:'tcPopD', class: 'tcOverlay'})
		.append($('<div>',{id:'tcResults'}))
		.append($('<div>',{id:'tcOther'}));
	    d.overlay({oneInstance: false
		       , left: window.innerWidth - 350
		       , top: 10
		      });
	    tc.popD = d;
	    $('body').append(d);
	} 
	d = tc.popD;
	switch(kind){
	case 'result':
	    $('#tcResults',d).append(revDiv);
	    break;
	default:
	    $('#tcOther',d).append(revDiv);
	}
	if(request.popD){
	    d.load();
	}
	tc.sendMessage({kind:'pageA',icon:icon});
	$('div#' + z + ' a[tcstat]').click(function(){
	    tc.sendMessage({kind: 'sendstat'
	 		    , key: this.attributes['tcstat'].value});
	});
	$(window).scroll(function(){
	    d.data("overlay").close();
	});
	d.mouseenter(function(){
	    $(window).off('click');
	});
	d.mouseleave(function(){
	    $(window).click(function(){
		d.data("overlay").close();
	    });
	});

	// really irritating when the dialog steals focus
	if(request.popD){
	    document.activeElement.blur();
	}
    }

    tc.sigURL = function(url){
	// turn a url into some sort of canonicalized version
	// unfortunately this varies by site so this will be an imperfect exercise
	if(!url) return;
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
	return ret.replace(/https?:\/\//,'').replace(/\/$/,'').replace(/\s+/g,'').toLowerCase();
    }

    tc.htmlDecode = function(value){ 
	return $('<div/>').html(value).text(); 
    }

    tc.iconDialog = function(title,body,iconId){
	body.addClass('tcIconOverlay');
	body.overlay({fixed: false
		      , oneInstance: false});
	var d = body.data('overlay');
	$("div#"+iconId ).hover(
	    function(event){ 
		d.load();		
		body.css({left: event.pageX - 15, top:event.pageY - 15,display: 'inline'});
		body.mouseleave(function(e){ d.close(); });
		$(window).scroll(function(e){ d.close(); });
		return false;}
	);
	$('div#d' + iconId+' a[tcstat]').click(function(){
	    tc.sendMessage({'kind': 'sendstat'
	 		    , 'key': this.attributes['tcstat'].value});
	});
    }
    
    tc.onResponse = function(request){
	tc.responses[request.kind](request);
    }

    tc.sendMessage = function(request){
	chrome.extension.sendRequest(request, tc.onResponse);
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
		if(!target){
		    // don't know where to put it so return after we set tcLink
		    return;
		}
		var sid = "gs" + tc.random();
		target.setAttribute("sid",sid);
		var url = tc.sigURL(href);
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


    tc.renderTemplate = function(data,r,key,rdc){
	var detail = JSON.parse(data.data);
	if(typeof(detail) != "object")
	    detail = {};
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = key;
	detail.url = data.url;
	detail.tcstat = rdc.tcstat;
	detail.id = data.id;
	var d = $("<div>",{id: "d"+r, class: "tcOverlay"}).appendTo('body');
	new EJS({text: rdc.template}).update("d"+r,detail);
	return d;
	
    };

    tc.resultPrev = function(n,key,data){
	var r = tc.random();
 	var rdc = JSON.parse(data.template_data);
	var d = tc.renderTemplate(data,r,key,rdc);
        // if(data.subtype == 'imgad'){
        //     console.log('imgad');
        //     tc.insertImgAd(n, rdc.icon, r, rdc.title, d);
        // } else {
	    tc.insertPrev(n, rdc.icon, r, rdc.title, d);
//	}
    }

    tc.random = function(){return Math.floor(Math.random() * 100000);}
}
