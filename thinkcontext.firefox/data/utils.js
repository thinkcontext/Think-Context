if (window.frameElement === null){
    var tc = {};
    tc.dialogs = [];
    tc.responses = {};
    tc.popD = null;

    tc.resultDialogConfig = {
	rushBoycott:  { 
	    template: '<%= name %> is listed as an advertiser of Rush Limbaugh\'s by <a href="http://stoprush.net/" target="_blank">The Stop Rush Project</a>.  Click <%= link_to("here", url, {target: "_blank"}) %> for more information on this advertiser.'
	    , title: "Rush Limbaugh Advertiser"
	    , icon: 'stopRush'
	    , tcstat: 'grb'
	}
	, greenResult: {
	    title: 'Member of the Green Business Network'
	    , icon: 'greenG'
	    , tcstat: 'bsg'
	    , template: '<a target="_blank" href="http://<%= key %>"><%= name %></a> - <%= desc %>'
	}

	, hotelsafe: {
	    title: 'Patronize'
	    , icon: 'greenCheck'
	    , tcstat: 'bsp'
	    , template: '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends patronizing this hotel.'
	}
	, hotelboycott: {
	    title: 'Boycott'
	    , icon: 'redCirc'
	    , tcstat: 'bsp'
	    , template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends boycotting this hotel.'
	}
	, hotelrisky: {
	    title: 'Risky'
	    , icon: 'infoI'
	    , tcstat: 'bsp'
	    , template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> advises that there is a risk of a labor dispute at this hotel.'
	}
	, hotelstrike: {
	    title: 'Strike'
	    , icon: 'redCirc'
	    , tcstat: 'bsp'
	    , template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends boycotting this hotel.'
	}
    };

    tc.resultDialogConfig.boycott = tc.resultDialogConfig.hotelboycott;
    tc.resultDialogConfig.patronize = tc.resultDialogConfig.hotelsafe;
    tc.resultDialogConfig.risky = tc.resultDialogConfig.hotelrisky;
    tc.resultDialogConfig.strike = tc.resultDialogConfig.hotelstrike;

    tc.debug = function(txt){ 
	//console.log(txt); 
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

    // ick but need to keep in sync with icons directory
    tc.iconStatus = {fair:	1,
		     change:	1,
		     ccan:	1,
		     cepr:	1,
		     ej:	1,
		     ips:	1,
		     ggw:	1,
		     alter:	1,
		     pih:	1,
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
		     truthout:	1,
		     thinkprogress:	1,
		     truthdig:	1,
		     jwj:	1,
		     bust:	1,
		     fww:	1,
		     narco:	1,
		     pogo:	1,
		     pk:	1,
		     mj:	1,
		     saveinter:	1,
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
		     altoarizona:	1,
		     dcfpi:	1,
		     feministing:	1,
		     nationb:	1,
		     usas:      1,
		     greena:	1,	  
		     laborn: 1
		    };
    
    self.postMessage({'kind': 'resource'});
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

    tc.sendMessage = function(request){
	self.postMessage(request);
    }
    
    tc.activeateResponses = function(){
	self.on('message',tc.onResponse);
    }
    tc.activeateResponses();

    tc.insertPrev = function(n,iconName,r,title,theDiv){
	if(!n.previousSibling || !n.previousSibling.getAttribute || !n.previousSibling.getAttribute('subv')){ 
	    var resDiv = $('<div>'
			   , { id: r
			       , subv: true
			       , style: 'display: inline;padding-bottom: 3px;padding-left: 3px;padding-top: 3px;padding-right: 3px;' })
		.append($('<img>', { src: tc.icons[iconName]}))[0];
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
		.append($('<div>',{id:'tcReverse'}))
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
	case 'reverse':
	    $('#tcReverse',d).append(revDiv);
	    break;
	default:
	    $('#tcOther',d).append(revDiv);
	}
	if(autoOpen){
	    d.dialog('open');
	}
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
	    self.postMessage({'kind': 'sendstat'
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

    tc.reverseExamine = function(){
	var urlmap;
	urlmap = $("a[href^='http']:visible").not('[tcRev]').map(function(){
	    this.setAttribute('tcRev','tcRev');
	    if(this.textContent.match(/\w/) && tc.sigURL(this.href) != tc.sigURL(document.URL)){
		return tc.sigURL(this.href);
	    }});
	if(urlmap.length > 0){
    	    var revArr = jQuery.makeArray(urlmap);
    	    while(revArr.length > 0){
    		tc.sendMessage(
    		    {'kind': 'reversehome'
    		     , 'key': revArr.slice(0,400)
    		    });
    		revArr.splice(0,400);
    	    }
	}
    }

    tc.reverseResponseTwit = 0;
    tc.reverseResponseFB = 0;
    tc.reverseResponse = function(request){
	var data = request.data;
	var out = {};
	var t;
	var docHost = tc.getReverseHost(document.baseURI);
	for(var i in data){
	    t = data[i].reverse_link;
	    if(docHost != tc.getReverseHost(data[i].link)){
		if(!out[t]){
		    out[t] = { }
		}
		out[t][data[i].link] = data[i];
	    }
	}
	var tcstat = 'rrh';
	var jsearch = "href";
	if(tc.reverseResponseTwit == 1)
	    jsearch = 'data-expanded-url';
	for(var rl in out){
	    jsearch = 'a[href^="'+rl+'"]:visible';
	    if(tc.reverseResponseFB == 1)
		jsearch = "a[href*='facebook.com/l.php?u=" + encodeURIComponent(rl) + "']";
	    $(jsearch).map(function(){
		if(!(this.previousSibling && this.previousSibling.getAttribute && this.previousSibling.getAttribute("subv"))){
		    if(this.textContent.match(/\w/)){
			var r = tc.random();
			var revDiv = $('<div>',{id: "d"+r}).appendTo('body');
			new EJS({text: tc.revEjs}).update("d"+r,{data:out[rl],ex:false});
			var height = document.defaultView.getComputedStyle(this).getPropertyValue('font-size');
			var resDiv = document.createElement("div");
			resDiv.setAttribute("id",r);
			resDiv.setAttribute("subv",true);
			resDiv.style.display = "inline";
			resDiv.style.height = height + "px";
			resDiv.style.width = height + "px";;
			var redih = document.createElement("img");
			redih.src = tc.icons['trackback16'];
			redih.style.height = height;// + "px";
			redih.style.width = height;// + "px";
			redih.style.margin = "1px";
			redih.style.display = "inline";
			resDiv.appendChild(redih);
			this.parentNode.insertBefore(resDiv,this);
			this.style.display = "inline";
			tc.iconDialog("Progressive Trackback", revDiv, r);
		    }
		}
	    });
	}
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

//    tc.sub = {};

    tc.resultPop = function(request){
	var data = request.data;
	var detail = JSON.parse(data.data);
	var rdc = tc.resultDialogConfig[data.func];
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
	var rdc = tc.resultDialogConfig[data.func];
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
		     )
    }

    tc.place = function(n, cid,data){
	var rdc = tc.resultDialogConfig['hotel' + data.type];
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

    // hyatt_result: function(n,key,data){
    // 	// passed a google search result, insert a dialog
    // 	// "n" is the header link for the result

    // 	var tcstat = 'gsh';
    // 	tc.insertPrev(n
    // 		      ,'infoI'
    // 		      ,'Info from Hotel Workers Rising','<b><a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">Hyatt Hurts Our Economic Recovery</a></b> - In city after city across North America, Hyatt Hotels is leading the fight against middle class jobs for hotel workers. Nationwide, the hotel industry is rebounding faster and stronger than expected, with a hearty rebound projected in 2011 and 2012. Hyatt reported that as of June 30, 2010 it had over $1.6 billion in cash and short term investments available.<p>Despite a strong recovery for the hotel industry, hotels are still squeezing workers and cutting staff. While this marks a trend involving several major hotel companies, Hyatt is the starkest example. Hyatt is using the weak economy as an excuse to slash benefits, eliminate jobs and lock workers into the recession. <a tcstat="' + tcstat + data.id + '" target="_blank" href="http://hotelworkersrising.org/hyatt/">more info</a>'
    // 		     );
    // }

    tc.random = function(){return Math.floor(Math.random() * 100000);}

tc.revEjs = " <%  \
var found = 0; \
var tcstat = 'rrr'; \
 \
if(ex){ \
 \
%> \
 \
<b>This link was mentioned in</b><br> \
	 \
<%   }  \
for(var x in data){ \
    if(data[x]['s'] != 'exact' && found == 0){ \
 \
%> \
<b>Other links to this site</b><br> \
<% \
	    found = 1;	 \
    } \
     \
%> \
 \
<li> \
 \
<% \
    if(tc.iconStatus[data[x].source] == 1){  \
%> \
<%=	img_tag(tc.iconDir + \"/\" + data[x].source + \".ico\" \
		, null \
		, { height: \"16\", width: \"16\", style: \"display:inline;\" }) %> \
<%    }  %> \
<%=    link_to(tc.htmlDecode(data[x].title) \
	    , data[x].link \
	    , {target: '_blank', tcstat: tcstat + data[x].id }) \
%> \
 \
by \
 \
<%=  link_to(data[x].name, data[x].source_link) %> \
links to \
<%=  link_to('this page',data[x].reverse_link) %> \
<% \
} \
 \
%> \
 \
";

}