if (window.frameElement === null){
    var tc = {};
    tc.dialogs = [];
    tc.responses = {};
    tc.popD = null;

    tc.debug = function(txt){ 
	//console.log(txt); 
    }

    tc.sendMessage = function(request){
	self.postMessage(request);
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
					 ,unitehere : tc.iconDir + "/unitehere.ico"
					 ,trackback16: tc.iconDir + "/trackback-16.png"
					 ,trackback32: tc.iconDir + "/trackback-32.png"};
			});

    tc.sendMessage({'kind': 'resource'});
    tc.getReverseHost = function(url){
	var host;
	var ar;
	var tld;
	if(host = url.split('/')[2]){
	    ar = host.split('.');
	    if(ar[0] == 'www'){
		ar.shift();
	    }
	    tld = ar[ar.length - 1];
	    if(ar.length <= 2){
		return ar.join('.')
	    } else if((tld == 'com'
		       || tld == 'net'
		       || tld == 'gov'
		       || tld == 'edu'
		       || tld == 'org')
		      && !(tld == 'com' 
			   && (ar[ar.length - 2] == 'patch'
			       || ar[ar.length - 2] == 'cbslocal'
			       || ar[ar.length - 2] == 'curbed'
			       || ar[ar.length - 2] == 'curbed'
			       || ar[ar.length - 2] == 'craigslist')
			  )){
		return ar.slice(ar.length - 2).join('.')
	    } else {
		return ar.slice(ar.length - 3).join('.')
	    }
	}
	return null;
    }
    
    tc.onResponse = function(request){
	tc.responses[request.kind](request);
    }
    
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
	} else if(ret.match(/http(s)?:\/\/(\w*\.)?abclocal\.go\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?abcnews\.go\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?thekojonamdishow\.org/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?businessday\.co\.za/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?bwint\.org/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?ctlawtribune\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?interfax\.ru/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?ipsnews\.net/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?salon\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?sfgate\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?thehour\.com/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?npr\.org\/templates/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?washingtonpost\.com\/todays_paper/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?espn\.go\.com\/video\/clip/)	      
		  || ret.match(/http(s)?:\/\/(\w*\.)?cbsnews\.com\/video\/watch/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?washingtonpost\.com\/ac2\/wp-dyn/)
		  || ret.match(/http(s)?:\/\/(\w*\.)?dyn\.politico\.com\/printstory.cfm/)
		  || ret.match(/http(s)?:\/\/([\w\-\.])+\.gov\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*\.bloomberg\.com\/apps\/quote/)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*mobile\.washingtonpost\.com\/c\.jsp/)	     
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*businessweek\.com\//)	
		  || ret.match(/http(s)?:\/\/query\.nytimes\.com\//)     
		  || ret.match(/http(s)?:\/\/dealbook\.on\.nytimes\.com\/public\/overview/)     
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*google\.com\/url/)     
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*radioink\..com\//) 
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*scientificamerican\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*wtop\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*un\.org\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*sports\.espn\.go\.com\/espn\/espn25\/story/)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*wunderground\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*thefreshoutlook\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*phoenixnewtimes\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*int\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*edu\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*sports\.espn\.go\.com\/espn\/eticket\/story\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*nymag\.com\/print\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*metroweekly\.com\/news\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*defensenews\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*msmagazine\.com\/news\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*unep\.org\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*lamag\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*9news\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*oecd\.org\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*archives\.newyorker\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\-\.]*\.)*select\.nytimes\.com\//)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?govtrack\.us\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?markets\.ft\.com\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?irinnews\.org\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?jpost\.com\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?cato\.org\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?wtop\.com\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?money\.msn\.com\/[^"?]+/)
		  || ret.match(/http(s)?:\/\/([\w\.]*\.)?npr\.org\/player\/v2\/mediaPlayer\.html[^"?]+/)	     
		 ){
	    ret = ret.split('#')[0];	      
	} else if(ret.match(/(\w*\.)?cbc.ca\/video/)
		  || ret.match(/(\w*\.)?cnn.com\/video\//)){
	    ret = ret;
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

    tc.closeAllDialogs = function(){
	for(var d in tc.dialogs){
	    tc.dialogs[d].dialog('close');
	}
    }

    tc.googlePlaces = function(request){ 
	var data = request.data;
	var d, icon, title, blurb, rdc, tcstat = 'gsp';
	for(var r in data){
	    d = data[r];
	    blurb = $("<div>",{id: "d"+r}).appendTo('body');
	    rdc = tc.resultDialogConfig[d.type];
	    new EJS({text: rdc.template}).update("d"+r);
	    tc.googlePlacesHandler(d.siteid, rdc.icon ,rdc.title ,blurb);
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
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = request.data.key;
	detail.url = data.url;

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
		
		console.log('in map',this,href);
		if(placer)
		    target = placer(this);
		console.log('target',target);
		this.setAttribute('tcLink','tcLink');
		var sid = "gs" + tc.random();
		target.setAttribute("sid",sid);
		console.log(this,this.href);
		var url = tc.sigURL(href).replace(/https?:\/\//,'').replace(/\/$/,'');
		console.log(url);
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
		console.log('leave map');
	    }
	);
    };

    tc.resultPrev = function(n,key,data){
	var detail = JSON.parse(data.data);
	var rdc = JSON.parse(data.template_data);
	r = tc.random();
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = key;
	detail.url = data.url;

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
