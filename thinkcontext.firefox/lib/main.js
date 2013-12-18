var s = require("self");
var data = s.data;
var db = require("db");
var pageMod = require("page-mod");
var iconDir = s.data.url("icons");
var addontab = require("sdk/addon-page");
var tabs = require("sdk/tabs");

var icons = { hotelrisky : iconDir + "/infoI.png"
	      ,greenResult : iconDir + "/greenG.png"
	      ,hotelsafe : iconDir + "/greenCheck.png"
	      ,hotelboycott : iconDir + "/redCirc.png"
	      ,rushBoycott : iconDir + "/sr.png"
	      ,unitehere : iconDir + "/unitehere.ico"
	      ,trackback16: iconDir + "/trackback-16.png"
	      ,trackback32: iconDir + "/trackback-32.png"
	      ,bechdel: iconDir + "/greenCheck.png"
	      ,bcorp: iconDir + "/bcorp.ico"
};

// if(s.loadReason == 'upgrade'){
//     db.deleteReverse();
//     tabs.open(data.url('update.html'));
// } else if(s.loadReason == 'install'){
//     tabs.open(data.url('install.html'));
// }

pageMod.PageMod({
    include : "*.www.google.com",
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
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
	    case 'place':
		db.lookupPlace(key,request,function(r){worker.postMessage(r)});
		break;
	    case 'places':
		db.lookupPlaces(key,request,function(r){worker.postMessage(r);});
		break;
	    }
	}
		 )
    }
});

pageMod.PageMod({
    include : "*.plus.google.com",
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
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

var tabWorkers = {};
var urlbarButton = require("urlbarbutton").UrlbarButton, button;
button = urlbarButton({id: 'tcpopd'
		       , onClick: function(){
			   tabWorkers[tabs.activeTab.id].postMessage({kind:'tcPopD'});
		       }
		      });

var buttonTab = function(tab) {
    button.setVisibility(false,tab.url);
    button.setImage(false,tab.url);
    var domain = db.getReverseHost(tab.url);
    if(domain && (!( domain.match('google.com$') 
	  || domain.match('facebook.com$')
	  || domain.match('twitter.com$')
	  || domain.match('yahoo.com$')
	  || domain.match('bing.com$')
	)
       || domain == 'news.google.com'
       || domain == 'news.yahoo.com'
		  || domain == 'news.bing.com')
      ){    
	db.lookupResult({kind: 'link'
			 , key: sigURL(tab.url).replace(/https?:\/\//,'').replace(/\/$/,'')
			 , origLink: tab.url}
			, function(r){
			    button.setImage(icons[r.data.func],r.origLink);
			    button.setVisibility(true,r.origLink);
			});
    }
};

var buttonTabClose = function(tab){
    delete tabWorkers[tab.id];
};

tabs.on('ready', buttonTab);
tabs.on('activate', buttonTab);
tabs.on('close',buttonTabClose);

pageMod.PageMod({
    include : ["*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('utils.js')
	,data.url('reverse.js')
    ],
    onAttach:  function(worker){
	tabWorkers[worker.tab.id] = worker;
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
	    }
	});	
    }});   

pageMod.PageMod(
    {
	include : ["http://search.yahoo.com/search*","https://search.yahoo.com/search*","http://www.goodsearch.com/search.aspx"],
	attachTo: "top",
	contentStyleFile: data.url("jquery-ui.css"),
	contentScriptWhen:  'ready',
	contentScriptFile: [
	    data.url('jquery-2.0.0.min.js')
	    ,data.url('jquery-ui-1.9.2.custom.min.js')
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
		}
	    }
		     )
	}
    }
);
pageMod.PageMod({
    include : ["http://www.bing.com/search*","https://www.bing.com/search*"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
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
	    }
	})
    }});

pageMod.PageMod({
    include: "*.facebook.com",
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
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
	})}
});


pageMod.PageMod({
    include : ["*.adsonar.com"
	       ,"*.msn.com"
	       ,"*.doubleclick.net"
	       ,"*.overture.com"
	      ],
    attachTo: "frame",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.0.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
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
	} else if(ret.match(/^http(s)?:\/\/(\w*\.)*yahoo.com\//)){
	    ret = ret.split('?')[0].split('#')[0].split(';')[0];	      
	} else {
	    ret = ret.split('?')[0].split('#')[0];	      
	}
	return ret;
    }
