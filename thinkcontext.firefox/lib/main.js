var data = require('self').data;
var db = require("db");
var s = require("self");
var pageMod = require("page-mod");
var iconDir = s.data.url("icons");

var icons = { hotelrisky : iconDir + "/infoI.png"
	      ,greenResult : iconDir + "/greenG.png"
	      ,hotelsafe : iconDir + "/greenCheck.png"
	      ,hotelboycott : iconDir + "/redCirc.png"
	      ,rushBoycott : iconDir + "/sr.png"
	      ,unitehere : iconDir + "/unitehere.ico"
	      ,trackback16: iconDir + "/trackback-16.png"
	      ,trackback32: iconDir + "/trackback-32.png"};

pageMod.PageMod({
    include : ["http://www.google.com/*","https://www.google.com/*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('google-search.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
		request.data = iconDir;
		worker.postMessage(request);
		break;
	    case 'sendstat':
		db.sendStat(request.key);
		break;
	    case 'link':
		db.lookupResult(request, function(r){worker.postMessage(r)});
		break;
	    case 'links':
		db.lookupResults(request, function(r){worker.postMessage(r)});
		break;
	    case 'place':
		db.lookupPlace(key,request,function(r){worker.postMessage(r)});
		break;
	    case 'places':
		db.lookupPlaces(key,request,function(r){worker.postMessage(r);});
		break;
	    case 'gs-text':
	    	db.lookupSubvert(key,request,function(r){worker.postMessage(r)});
	    	break;
	    }
	}
		 )
    }
});

pageMod.PageMod({
    include : ["http://plus.google.com/*","https://plus.google.com/*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('google-place-page.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
		request.data = iconDir;
		worker.postMessage(request);
		break;
	    case 'sendstat':
		db.sendStat(request.key);
		break;
            case 'place':
		db.lookupPlace(key,request,function(r){worker.postMessage(r)});
		break;
	    }
	}
		 )
    }   
});

var urlbarButton = require("urlbarbutton").UrlbarButton, button;
button = urlbarButton({id: 'tcpopd'
		       , onClick: function(){
			   tabs.activeTab.attach;
		       }
		      });

var tabs = require("sdk/tabs");

var buttonTab = function(tab) {
    console.error("tab activate",tab.url);
    button.setVisibility(false,tab.url);
    button.setImage(false,r.origLink);
    db.lookupResult({kind: 'link'
		     , key: sigURL(tab.url).replace(/https?:\/\//,'').replace(/\/$/,'')
		     , origLink: tab.url}
		    , function(r){
			console.error("tab active lookupres",r.origLink);
			button.setImage(icons[r.data.func],r.origLink);
			button.setVisibility(true,r.origLink);
		    });
    db.lookupReverse(
	{kind: 'reverse'
	 , key: tc.sigURL(document.baseURI)
	}
	, function(r){

	}
    );


};
	
var activeWorker;
tabs.on('ready', buttonTab);
tabs.on('activate', buttonTab);

pageMod.PageMod({
    include : ["*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('reverse.js')
    ],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
	    	request.data = iconDir;
	    	worker.postMessage(request);
	    	break;
	    case 'sendstat':
	    	db.sendStat(request.key);
	    	break;
	    case 'link':
		db.lookupResult(request, function(r){worker.postMessage(r);});
		break;
            case 'reverse':
	    	db.lookupReverse(key,request,function(r){worker.postMessage(r)});
	    	break;
            case 'reversehome':
	    	db.lookupReverseHome(key,request,function(r){worker.postMessage(r)});
	    	break;
	    }
	}
		 )
    }   
});
pageMod.PageMod({
    include : ["http://search.yahoo.com/search*","https://search.yahoo.com/search*","http://www.goodsearch.com/search.aspx"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('yahoo-search.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
		request.data = iconDir;
		worker.postMessage(request);
		break;
	    case 'sendstat':
		db.sendStat(request.key);
		break;
	    case 'link':
		db.lookupResult(request, function(r){worker.postMessage(r)});
		break;
	    case 'place':
		db.lookupPlace(key,request,function(r){worker.postMessage(r)});
		break;
            case 'yahoo-text':
	    case 'gs-text':
            case 'bing-text':
		db.lookupSubvert(key,request,function(r){worker.postMessage(r)});
		break;
	    }
	})
    }});
pageMod.PageMod({
    include : ["http://www.bing.com/search*","https://www.bing.com/search*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('bing-search.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
		request.data = iconDir;
		worker.postMessage(request);
		break;
	    case 'sendstat':
		db.sendStat(request.key);
		break;
	    case 'link':
		db.lookupResult(request, function(r){worker.postMessage(r)});
		break;
	    case 'place':
		db.lookupPlace(key,request,function(r){worker.postMessage(r)});
		break;
            case 'yahoo-text':
	    case 'gs-text':
            case 'bing-text':
		db.lookupSubvert(key,request,function(r){worker.postMessage(r)});
		break;
	    }
	})
    }});
// pageMod.PageMod({
//     include : ["http://twitter.com/*","https://twitter.com/*"],
//     attachTo: "top",
//     contentStyleFile: data.url("jquery-ui.css"),
//     contentScriptWhen:  'ready',
//     contentScriptFile: [
// 			data.url('jquery-1.7.1.min.js')
// 			,data.url('jquery-ui-1.8.16.custom.min.js')
//	,data.url('ejs_production.js') 
// 			,data.url('utils.js')
// 			,data.url('twitter.js')],
//     onAttach: function(worker){
// 	worker.on('message', function(request){
// 	    var key = request.key;
// 	    var data;
// 	    switch(request.kind){
// 	    case 'resource':
// 		request.data = iconDir;
// 		worker.postMessage(request);
// 		break;
// 	    case 'sendstat':
// 		db.sendStat(request.key);
// 		break;
// 	    case 'link':
// 		db.lookupResult(request, function(r){worker.postMessage(r)});
// 		break;
// 	    case 'urlresolve':
// 		db.urlResolve(request, function(r){worker.postMessage(r)});
// 		break;
// 	    }
// 	})
//     }});
pageMod.PageMod({
    include : ["http://facebook.com/*","https://facebook.com/*","http://www.facebook.com/*","https://www.facebook.com/*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-1.7.1.min.js')
	,data.url('jquery-ui-1.8.16.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('facebook.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    switch(request.kind){
	    case 'resource':
		request.data = iconDir;
		worker.postMessage(request);
		break;
	    case 'sendstat':
		db.sendStat(request.key);
		break;
	    case 'link':
		db.lookupResult(request, function(r){worker.postMessage(r)});
		break;
	    case 'urlresolve':
		db.urlResolve(request, function(r){worker.postMessage(r)});
		break;
	    }
	})
    }});
function sigURL(url){
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