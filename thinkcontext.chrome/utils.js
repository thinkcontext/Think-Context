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
    // ick but need to keep in sync with icons directory
    tc.iconStatus = {fair:	1,
		     change:	1,
		     cepr:	1,
		     ej:	1,
		     ips:	1,
		     ggw:	1,
		     alter:	1,
		     cmj:	1,
		     color:	1,
		     itt:	1,
		     nation:	1,
		     eff:	1,
		     sob:	1,
		     soj:	1,
		     350:	1,
		     sbnyc:	1,
		     sbdc:	1,
		     sbla:	1,
		     sbsf:	1,
		     bitch:	1,
		     grist:	1,
		     prog:	1,
		     ucs:	1,
		     nrdc:	1,
		     fp:	1,
		     thinkprogress:	1,
		     truthdig:	1,
		     jwj:	1,
		     bust:	1,
		     fww:	1,
		     narco:	1,
		     pogo:	1,
		     pk:	1,
		     mj:	1,
		     fmc:	1,
		     climprog:	1,
		     fpif:	1,
		     onearth:	1,
		     propublica:	1,
		     dom:	1,
		     acrj:	1,
		     qcopy:	1,
		     otherwords:	1,
		     splc:	1,
		     dwn:	1,
		     amazonwatch:	1,
		     dn:	1,
		     dnb:	1,
		     ledc:	1,
		     cotton:	1,
		     ctj:	1,
		     innocence:	1,
		     dcfpi:	1,
		     feministing:	1,
		     nationb:	1,
		     usas: 1,
		     greena: 1,
		     laborn: 1
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
	    tc.sendRequest({kind: 'sendstat'
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
	    tc.sendRequest({'kind': 'sendstat'
	 		    , 'key': this.attributes['tcstat'].value});
	});
	tc.dialogs.push(d);
    }

    tc.intersect_safe = function(a, b)
    {
	var ai=0, bi=0;
	var result = new Array();

	while( ai < a.length && bi < b.length )
	{
	    if      (a[ai] < b[bi] ){ ai++; }
	    else if (a[ai] > b[bi] ){ bi++; }
	    else /* they're equal */
	    {
		result.push(a[ai]);
		ai++;
		bi++;
	    }
	}

	return result;
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
	detail.did = 'd'+r;
	detail.r = r;
	detail.key = request.data.key;
	detail.url = data.url;

	var d = $("<div>",{id: "d"+r}).appendTo('body');
	new EJS({text: rdc.template}).update("d"+r,detail);
	tc.popDialog(rdc.title, d, 'd'+r,request.popD,rdc.icon,'result');    
    }

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
