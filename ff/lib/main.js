var dbjs = require('./db.js');
var Request = require('sdk/request').Request;
var s = require("sdk/self");
var data = s.data;
var pageMod = require("sdk/page-mod");
var iconDir = s.data.url("icons");
var tabs = require("sdk/tabs");
var ss = require("sdk/simple-storage");
var time = require("sdk/timers");
setTimeout = time.setTimeout;
clearTimeout = time.clearTimeout;
setInterval = time.setInterval;
clearInterval = time.clearInterval;

function Ext(){
    var _self = this;
    _self.debug = 2;
    _self.schema = {
	thing: {
	    key: { keyPath: '_id' , autoIncrement: true },
	    // Optionally add indexes
	    indexes: {
                handles: { multiEntry: true },
                type: { },
		campaign_list: { multiEntry: true },
		notification_date: {}		
	    }
        }
    };
    _self.dbName = 'tc';
    _self.couch = 'http://127.0.0.1:5984/tc';
    //    _self.couch = 'http://lin1.thinkcontext.org:5984/tc';
    _self.dataUrl = _self.couch + '/_design/seq/_view/dataByCampaignSeq';
    _self.deactivateUrl = _self.couch + '/_design/seq/_view/dataByCampaignDeactivated';
    _self.metaUrl = _self.couch + '/_design/seq/_view/meta';
    _self.metaDeactivatedUrl = _self.couch + '/_design/seq/_view/metaDeactivated';
    _self.versionUrl = 'http://www.thinkcontext.org/version.json'
    _self.actions = {};
    _self.campaigns = {};    
    
    dbjs.open({server:_self.dbName,
	       version: 1
	       , schema:_self.schema})
	.done( function(db){
	    _self.db = db;
	    _self.getSubscribed();
	    _self.getOptions();
	    _self.getNotifications();
	    
	    if(s.loadReason == 'upgrade' || s.loadReason == 'install'){
		console.log('loadReason',s.loadReason);
		var url;
		_self.initialCamps();
		_self.setVersionTime();
		// if(s.loadReason == 'install'){
		// 	url = "options.html?install";
		// }else if(s.loadReason == "update"){
		// 	url = "options.html?update";
		// 	// port me
		// 	// remove websql tables
		// 	// var olddb = openDatabase('thinkcontext','1.0','thinkcontext',0);
		// 	// olddb.transaction(function(tx){
		// 	//     tx.executeSql('drop table template',[]); 
		// 	//     tx.executeSql('drop table place',[]); 
		// 	//     tx.executeSql('drop table place_data',[]); 
		// 	//     tx.executeSql('drop table results',[]); 
		// 	// });
		//}
		//    setTimeout(function(){tabs.open(data.url(url))}, 1000);	
	    }
	    _self.sync();
	});
    

    // var lastSyncTime = _self.lsGet('lastSyncTime')||0;

    // if(lastSyncTime == 0){
    // 	// we haven't done a sync before do it immediately
    // 	_self.sync();
    // } else if( (new Date) - (new Date(lastSyncTime)) > 4 * 3600 * 1000){
    // 	// we haven't done one in 4 hrs so do one 
    // 	// but wait a little bit first to not lag browser start
    // 	setTimeout(
    // 	    function(){
    // 		_self.sync();
    // 	    }
    // 	    , 5 * 60 * 1000); // 5 minutes 
    // }
    
    // setInterval(function(){_self.sync()}, 4 * 3600 * 1000);  // 4hrs
    // setInterval(function(){_self.getNotifications()}, 4.2 * 3600 * 1000);
}

Ext.prototype = {
    resetDB: function(callback){
	var _self = this, campaign;
	_self.lsRm('lastSyncTime');
	_self.lsRm('metaseq');
	_self.lsRm('metadea');
	for(var x = 0; x < _self.campaigns.length; x++){
	    campaign = _self.campaigns[x];
	    _self.lsRm('seq' + campaign);
	    _self.lsRm('dea' + campaign);
	}
	_self.db.thing.clear().done(
	    function(){
		if(typeof callback == 'function')
		    callback();
	    });
    },

    saveCampaigns: function(campaigns){
	var _self = this;
	campaigns = _self.uniqueArray(campaigns.sort());
	if(campaigns.join(',') != _self.campaigns.join(',')){
	    _self.lsSet('campaigns',JSON.stringify(campaigns));
	    _self.campaigns = campaigns;
	    _self.resetDB( function(){ _self.sync() });
	}
    },

    getSubscribed: function(){
	console.log('getSubscribed');
	var _self = this, c;
	if(c = _self.lsGet('campaigns')){
	    _self.campaigns = _self.uniqueArray(JSON.parse(c).sort());
	    _self.getAvailableCampaigns(
		function(campaigns){ 
		    var camp, actions = [];
		    for(var i in campaigns){
			camp = campaigns[i];
			if(_self.campaigns.indexOf(camp.tid) >= 0){
			    camp.actions.forEach(
				function(el,i,arr){ actions.push(el); }
			    );
			}
		    }
		    actions = _self.uniqueArray(actions);
		    if(actions.length > 0){		
			_self.getAvailableActions(
			    function(availableActions){ 
				var a;
				for(var i in availableActions){
				    a = availableActions[i];
				    if(actions.indexOf(a.tid) >= 0)
					_self.actions[a.tid] = a;
				}
				
			    }
			);
		    }
		});
	}
    },
    
    getAvailableActions: function(callback){
	var _self = this, ret = {};
	_self.db.thing.query('type').only('action').execute().done(
	    function(results){
		var action;
		for(var i in results){
		    action = results[i].tid
		    ret[action] = results[i];
		}
		callback(ret);
	    });
    },
    
    getAvailableCampaigns: function(callback){
	console.log("getAvailableCampaigns");
	var _self = this, ret = {};
	_self.db.thing.query('type').only('campaign').execute().done(
	    function(results){
		_self.debug >= 2 && console.log('getCampaigns result',results.length);
		var campaign;
		for(var i in results){
		    campaign = results[i].tid
		    ret[campaign] = results[i];
		}
		callback(ret);
	    });
    },

    fetchMetaDeactivated: function(){
	var _self = this;
	var metaDeact = parseInt(_self.lsGet('metadea')) || parseInt(_self.lsGet('metaseq')) || 0;
	Request({
	    url:_self.metaDeactivatedUrl, 
	    content: {startkey: metaDeact,
		      rando: Math.random() // remove me, pierces cache
		     } ,
	    onComplete: function(response){
		var data = response.json;
		var rows = data.rows;
		if(rows.length > 0){
		    for(var x = 0; x < rows.length; x++){
			_self.db.thing.remove(rows[x].key).done();
		    }
		    _self.lsSet('metadea', rows[rows.length -1].key);
		}
		setTimeout(function(){_self.getSubscribed();},500);
	    }	
	}).get();
    },
    
    fetchMetaData: function(){
	console.log('fetchMetaData');
	var _self = this;
	var metaSeq = parseInt(_self.lsGet('metaseq')) || 0;
	Request({
	    url: _self.metaUrl,
	    content: { include_docs: true,
		       startkey: metaSeq,
		       rando: Math.random() // remove me, pierces cache 
		     },
	    onComplete: function(response){
		var data = response.json;
		var rows = data.rows;
		if(rows.length > 0){
		    console.error("fetchMetaData",rows.length);
		    var insert = rows.map( function(x){ return x.doc; } );
		    req = _self.db.thing.add(insert).done(
		    	function(){
			    console.log('fetchMetaData insert success');
		    	    // _self.lsSet('metaseq', rows[rows.length -1].key);
		    	    // _self.fetchMetaDeactivated();
			    // var q = _self.db.from('thing').list(100);
			    // q.fail(
			    // 	function(e){ console.error("fail", e.message)});
			    // q.done(
			    // 	function(results){
			    // 	    console.log('done',results.length);
			    // 	    for(var i in results){
			    // 		console.log(i,results[i]._id);
			    // 	    }	
			    // 	});
		    	}
		    );
		    req.fail(function(e) {
		    	// there was a insert problem 
		    	console.error('fetchMetaData',e);
		    });
		} else {
		    _self.fetchMetaDeactivated();
	    	}		      
	    }
	}).get();
    },
    
    fetchCampaignDeactivated: function(campaign){
	var _self = this;
	var campDeact = parseInt(_self.lsGet('dea' + campaign)) || parseInt(_self.lsGet('seq' + campaign)) || 0;
	Request({
	    url: _self.deactivateUrl, 
	    content: {
		startkey: JSON.stringify([ campaign, campDeact ]),
		endkey: JSON.stringify([ campaign, {} ]),
		rando: Math.random() // remove me, pierces cache
	    } ,
	    onComplete: function(response){
		var data = response.json;
		var rows = data.rows;
		if(rows.length > 0){
		    for(var x = 0; x < rows.length; x++){
			_self.db.thing.remove(rows[x].key).done();
		    }
		    _self.lsSet('dea' + campaign, rows[rows.length -1].key[1]);
		}
	    }}).get();
    },

    fetchCampaignData: function(campaign){
	var _self = this;
	var campSeq = parseInt(_self.lsGet('seq' + campaign)) || 0;
	Request({url: _self.dataUrl, 
		 content: 
		 {include_docs: true,
		  startkey: JSON.stringify([ campaign, campSeq ]),
		  endkey: JSON.stringify([ campaign, {} ]),
		  rando: Math.random() // remove me, pierces cache
		 } ,
		 onComplete: function(response){
		     var data = response.json;
		     var rows = data.rows;
		     if(rows.length > 0){
			 var insert = rows.map( function(x){ return x.doc } );
		      	 req = _self.db.thing.add(insert);
		      	 req.done(
			     function(){
		      		 _self.lsSet('seq' + campaign, rows[rows.length -1].key[1]);
		      		 _self.fetchCampaignDeactivated(campaign);
			     }
		      	 );
		      	 req.fail(function(e,x) {
		      	     // there was a insert problem 
		      	     console.error('fetchCampaignData fail',campaign,x.results);
		      	 });
		     } else {
		      	 _self.fetchCampaignDeactivated(campaign);
		     }
		 }}).get();				  
    },
    
    sync: function(){	
	var _self = this;
	_self.debug && console.log('sync',_self.campaigns);
	_self.fetchMetaData();
	for(var x = 0; x < _self.campaigns.length; x++){
	    _self.debug >= 2 && console.log('sync camp',_self.campaigns[x]);
	    _self.fetchCampaignData(_self.campaigns[x])
	}
	_self.lsSet('lastSyncTime', (new Date).toJSON());	
    },
    
    sendStat: function(key){
	if(key.match(/^\w+$/))
	    Request({url:'http://thinkcontext.org/s/?' + key}).get();
    },
    lookup: function(handle,request,callback){
	var _self = this;
	var req ;
	var campaign, hmatch;
	_self.debug && console.log('lookup',handle);
	if(request.handle.match(/^domain:/)){
	    req = _self.db.thing.query('handles').bound(handle.split('/')[0],handle.split('/')[0] + '}').execute();
	    req.done(
		function(results){
		    _self.debug && console.log(results,handle);
		    request.results = [];
		    for(var i in results){
			for(var k in results[i].handles){
			    console.log('handle',results[i].handles[k]);
			    if(handle.indexOf(results[i].handles[k]) == 0){
				hmatch = results[i].handles[k];
				for(var j in results[i].campaigns){
				    if(_self.campaigns.indexOf(j) >= 0){
					campaign = results[i].campaigns[j];
					campaign.action = _self.actions[campaign.action];
				    }
				}
				request.results.push(results[i]);
				break;
			    }
			}
		    }
		    if(request.results.length > 0){
			_self.debug && console.log('domain returning',request);
			_self.resultsPrep(request,callback,hmatch);
		    }
		    return;			    		
		});
	} else {
	    req = _self.db.thing.query('handles').only(handle).execute().done(
		function(results){
		    if(results[0]){
			for(var j in results[0].campaigns){
			    if(_self.campaigns.indexOf(j) >= 0){
				campaign = results[0].campaigns[j];
				campaign.action = _self.actions[campaign.action];
			    }
			}
			request['results'] = results;
			_self.debug && console.log(request);
			_self.resultsPrep(request,callback,handle);
		    }
		});
	}
    },

    resultsPrep: function(request,callback,hmatch){
	var _self = this;
	if(request.kind == 'pop'){
	    switch(_self.popd){
	    case 'never':
		request.popD = false;
		break;
	    case 'every':
		request.popD = true;
		break;
	    case 'session':
		if(! sessionStorage.getItem('tcPopD_' + hmatch)){
		    request.popD = true;
		    sessionStorage.setItem('tcPopD_' + hmatch,1);
		} else {
		    request.popD = false;
		}
		break;
	    default:
		if(! _self.lsGet('tcPopD_' + hmatch)){
		    request.popD = true;
		    _self.lsSet('tcPopD_' + hmatch,1);
		} else {
		    request.popD = false;
		}		
	    }
	}
	_self.debug && console.log('resultsPrep',request.handle);
	callback(request);
    },

    getOptions: function(){
	var _self = this;
	_self.popd = _self.lsGet('opt_popD');
    },
    
    sendNotification: function(title,message){
	// chrome.notifications.create(
	//     result._id
	//     , {type: "basic"
	//        , title: title
	//        , message: message
	//        , iconUrl: 'icons/tc-64.png'
	//       }
	//     , function(x){}	    );
    },
    
    getNotifications: function(){
	var _self = this;
	var lnt = _self.lsGet('lastnotifytime');
	var now = new Date;
	if(lnt){
	    if(now - new Date(lnt) > 7 * 24 * 3600 * 1000){  // one week
		_self.checkOldVersion();
		_self.db.thing.query('type').only('notification').execute().done(
		    function(results){
			var result;
			for(var i in results){
			    result = results[i];
			    if(result.notification_date >= lnt && result.kind == 'meta'){
				_self.sendNotification(result.title,result.text);
			    }
			}
		    }
		);
	    }
	} else {	
	    _self.lsSet('lastnotifytime',now);
	}
    },
    
    checkOldVersion: function(){	
	var _self = this, vt =_self.getVersionTime(), now = new Date, currentVersion = chrome.runtime.getManifest().version;
	if(vt && now - vt > (1000 * 3600 * 24 * 30)){
	    // its been a month so lets check    
	    Request({url:_self.versionURL,
		     onComplete: function(response){
			 var results = response.json;
			 if(results.releaseDate - vt > 1000 * 3600 * 24 * 14 && results.version != currentVersion){
			     _self.sendNotification("New Version Available","A new version is available and the one installed is more than 2 weeks out of date");
			 }
		     }}).get();
	} else {
	    _self.setVersionTime();
	}	
    },
    
    uniqueArray:  function(a) {
	if(a)
	    return a.reduce(function(p, c) {
		if (p.indexOf(c) < 0) p.push(c);
		return p;
	    }, []);
    },
    
    initialCamps: function(){
	var _self = this;
	if(_self.lsGet('campaigns')) // there's existing config so return
	    return;

	var newCamps = ['congress','climatecounts'];
	[ 'opt_rush','opt_green','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ].forEach(
	    function(o){
		if(_self.lsGet(o) != 0){
		    newCamps.push(o.replace('opt_',''));
		}
		_self.lsRm(o);
	    });
	_self.lsSet('campaigns', JSON.stringify(newCamps));    
    },
    lsSet: function(x,y){
	ss.storage[x] = y;
    },
    lsGet: function(x){
	return ss.storage[x];
    },
    lsRm: function(x){
	ss.storage[x] = null;
    },
    setVersionTime: function(){
	var _self = this, d = new Date;
	_self.lsSet('versionTime', d.toJSON());
    },
    getVersionTime: function(){
	var _self = this, j, ret;
	j = _self.lsGet('versionTime');
	if(j)
	    ret = new Date(j);
	return ret;
    },
    getJSON: function(url,content,func){
	// simulate jQuery's $.getJSON
	Request({url: url,
		 content: content,
		 onComplete: function(response){
		     func(response.json);
		 }
		}).get();
    },
    get: function(url){
	// simulate jQuery's $.get
	Request({url:url}).get();
    }        
}

var tc = new Ext();

// port me
// chrome.pageAction.onClicked.addListener(
//     function(tab){
// 	chrome.tabs.sendMessage(tab.id,{kind: 'tcPopD'});
//     });

// port me
// chrome.notifications.onClicked.addListener(
//     function(notificationId){
// 	chrome.tabs.create({url:"options.html"});
//     });

// browser specific
// function onRequest(request, sender, callback) {
//     if(request.kind == 'pageA'){
// 	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
// 	chrome.pageAction.show(sender.tab.id);
//     } else if(request.kind == 'sendstat' && !sender.tab.incognito){
// 	tc.sendStat(request.key);
//     } else if(request.handle){
// 	tc.lookup(request.handle,request,callback);
//     } else {
// 	console.log("couldn't get a handle",request);
//     }   
// }

pageMod.PageMod({
    include : ["*.www.google.com",
	       "*.maps.google.com"],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'ready',
    contentScriptFile: [
	data.url('jquery-2.0.3.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('mutation-summary.js')
	,data.url('jquery.mutation-summary.js')
	,data.url('utils.js')
	,data.url('reverse.js')
	,data.url('google-search.js')],
    onAttach: function(worker){
	worker.on('message', function(request){
	    if(request.kind == 'pageA'){
		// 	chrome.pageAction.setIcon({tabId:sender.tab.id,path:request.icon});
		// 	chrome.pageAction.show(sender.tab.id);
	    } else if(request.kind == 'sendstat' && !sender.tab.incognito){
 		tc.sendStat(request.key);
	    } else if(request.handle){
		tc.lookup(request.handle,request, function(r){ worker.postMessage(r) });
	    } else {
 		console.log("couldn't get a handle",request);
	    }
	});
    }
});		

setTimeout(function(){
    console.log('campaigns',tc.campaigns);
    tc.db.thing.query('handles').bound('domain:leahy','domain:leahy}').execute().done(function(x){console.log('domain',x)});
    tc.db.thing.query('handles').only('facebook:senatorpatrickleahy').execute().done(function(x){console.log('fb',x)})
}, 5000);
