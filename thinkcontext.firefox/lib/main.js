var data = require('self').data;
var db = require("db");
var s = require("self");
var pageMod = require("page-mod");
var iconDir = s.data.url("icons");

pageMod.PageMod({
    include : ["http://www.google.com/*","https://www.google.com/*"],
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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


// maps
//pageMod.PageMod();

pageMod.PageMod({
    include : ["http://plus.google.com/*","https://plus.google.com/*"],
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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
pageMod.PageMod({
    include : ["*"],
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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
//     contentStyleFile: data.url("jquery-ui.css"),
//     contentScriptWhen:  'ready',
//     contentScriptFile: [
// 			data.url('jquery-1.7.1.min.js')
// 			,data.url('jquery-ui-1.8.16.custom.min.js')
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
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
			data.url('jquery-1.7.1.min.js')
			,data.url('jquery-ui-1.8.16.custom.min.js')
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
