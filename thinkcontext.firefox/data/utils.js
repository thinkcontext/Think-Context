if (window.frameElement === null){
    var tc = {};
    tc.responses = {};
    tc.popD = null;

    tc.debug = function(txt){ 
	//console.log(txt); 
    }

    tc.sendMessage = function(request){
	self.postMessage(request);
    }

    tc.onResponse = function(request){
	if(request.data.data)
	    request.data.data = JSON.parse(request.data.data);
	if(request.data.template_data)
	    request.data.template_data = JSON.parse(request.data.template_data);
	tc.responses[request.kind](request);
    }

    tc.registerResponse = function(kind, func){
	tc.responses[kind] = func;
    }

    tc.registerResponse('tcPopD'
			,function(r){
			    if(tc.popD.dialog('isOpen')){
				tc.popD.dialog('close');
			    } else {
				tc.popD.dialog('open');
			    }
			});

    tc.registerResponse('resource'
			, function(request){
			    var ar;
			    tc.iconDir = request.data;
			    ar = request.data.split('/');
			    ar.pop();
			    tc.resDir = ar.join('/');
			    tc.icons = { infoI : tc.iconDir + "/infoI.png"
					 ,greenG : tc.iconDir + "/greenG.png"
					 ,greenCheck : tc.iconDir + "/greenCheck.png"
					 ,redCirc : tc.iconDir + "/redCirc.png"
					 ,stopRush : tc.iconDir + "/sr.png"
					 ,hrc: tc.iconDir + "/hrc.png"
					 ,hrcapprox: tc.iconDir + "/hrc-approx.png"
					 ,hrcnot: tc.iconDir + "/hrc-notequal.png"};			    
			});

    tc.sendMessage({'kind': 'resource'});
    
    tc.activeateResponses = function(){
	self.on('message',tc.onResponse);
    }
    tc.activeateResponses();

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

    tc.resultPrev = function(n,key,data){
	var r = tc.random();
 	var rdc = data.template_data;
	var d = tc.renderTemplate(data,r,key,rdc);
        // if(data.subtype == 'imgad'){
        //     console.log('imgad');
        //     tc.insertImgAd(n, rdc.icon, r, rdc.title, d);
        // } else {
	tc.insertPrev(n, rdc.icon, r, rdc.title, d);
	// }
    }
    
    tc.random = function(){return Math.floor(Math.random() * 100000);}
    
}
