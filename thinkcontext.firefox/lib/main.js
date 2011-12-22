var data = require('self').data;
var db = require("db");
var s = require("self");

var pageMod = require("page-mod");
var iconDir = s.data.url("icons");

pageMod.PageMod({
    include : "http://www.google.com/*",
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
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
            case 'finance':
	    case 'gs-finance':
            case 'bing-finance':
            case 'gp-finance':
            case 'yahoo-finance':
		db.lookupStock(key,request,function(r){worker.postMessage(r)});
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
    include : "http://www.google.com/finance*",
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
			,data.url('google-finance-page.js')],
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
            case 'gp-finance':
		db.lookupStock(key,request,function(r){worker.postMessage(r)});
		break;
	    }
	}
		 )
    }   
});

pageMod.PageMod({
    include : "http://maps.google.com/maps/place*",
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
			,data.url('google-place-page.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    var key = request.key;
	    var data;
	    //console.log(request.kind);
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
pageMod.PageMod({
    include : ["*"],
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
			,data.url('reverse.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    console.log("main");
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
    include : "http://search.yahoo.com/search*",
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
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
            case 'finance':
	    case 'gs-finance':
            case 'bing-finance':
            case 'gp-finance':
            case 'yahoo-finance':
		db.lookupStock(key,request,function(r){worker.postMessage(r)});
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
    include : "http://www.bing.com/search*",
    contentScriptWhen:  'ready',
    contentScriptFile: [data.url('jquery-ui.css.js')
			,data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
			,data.url('utils.js'),
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
            case 'finance':
	    case 'gs-finance':
            case 'bing-finance':
            case 'gp-finance':
            case 'yahoo-finance':
		db.lookupStock(key,request,function(r){worker.postMessage(r)});
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
