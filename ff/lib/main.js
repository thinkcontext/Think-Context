var db = require('./db.js');
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
var ui = require("sdk/ui");
var defaultIcon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH3gkSFTsC27HFFQAAAPxJREFUKM+F0r1KQ0EQBeAvcgkWYiEprKws5FZiYXELUfA5rEKwCBYpQkgh+ASWKX0XC99AEFQQbiGilSJ6UcFmhGXz48AWe2bOzsw52zIdBSpsxf0GV/i2II5Q4wf3cb7wiO480jkanKKT4GsY4wOTWZ0a7CfYMUbJvcI7eulOdXRKo44uRYIN8YQ27MVOnYxYYifDVmOywyLUe8BLVnQWjx0k2CvuUBYLFN7G+rzkUvi0Eer9FyvYDI4ifBpnRbd4y7ABnrH8B3RDwSopOske2w07+vkYk0gMQ710vEHkLmK9qeiFTw2u4zQxXj8ltWaQ2+FtmXzyS3ymRb8KQDZXemSofgAAAABJRU5ErkJggg=="; // infoI

function Ext(){
    var _self = this;
    _self.version = '1.3';
    _self.debug = 0;
    _self.schema = {
	thing: {
	    key: { keyPath: '_id' },
	    indexes: {
                handles: { multiEntry: true },
                type: { },
		campaign_list: { multiEntry: true },
		notification_date: {}		
	    }
        }
    };
    _self.dbName = 'tc';
    //_self.couch = 'http://127.0.0.1:5984/tc';
    _self.couch = 'http://lin1.thinkcontext.org:5984/tcv1';
    _self.dataUrl = _self.couch + '/_design/seq/_view/dataByCampaignSeq';
    _self.deactivateUrl = _self.couch + '/_design/seq/_view/dataByCampaignDeactivated';
    _self.metaUrl = _self.couch + '/_design/seq/_view/meta';
    _self.metaDeactivatedUrl = _self.couch + '/_design/seq/_view/metaDeactivated';
    _self.versionUrl = 'http://www.thinkcontext.org/version.json'
    _self.actions = {};
    _self.campaigns = {};    
    
    db.open({server:_self.dbName,
	       version: 2
	       , schema:_self.schema})
	.done( function(dbjs){
	    _self.db = dbjs;
	    _self.getSubscribed();
	    _self.getOptions();
	    _self.getNotifications();
	    
	    var lastSyncTime = _self.lsGet('lastSyncTime')||0;

	    if(! _self.lsGet('tcversion') && ! _self.lsGet('resultsversion')){
		// new install
		_self.lsSet('tcversion',_self.version);
		_self.initialCamps();
		_self.setVersionTime();    
		_self.fetchMetaData(function(){ openInstall(); _self.sync();});    
	    }
	    else if(! _self.lsGet('tcversion') && _self.lsGet('resultsversion')){
		// was update from sqlite version
		// now removed
		console.error('old sqlite version');
		
	    } else if(_self.lsGet('tcversion') != _self.version){
		// update
		_self.lsSet('tcversion',_self.version);
		_self.initialCamps();
		_self.setVersionTime();
		setTimeout(function(){ _self.resetDB(_self.sync); }, 15000);	
	    } else if(_self.lsGet('tcversion') == _self.version){	    
		if(lastSyncTime == 0 && _self.getVersionTime()){
    		    // we haven't done a sync before do it immediately
    		    _self.sync();
		} else if( (new Date) - (new Date(lastSyncTime)) > 4 * 3600 * 1000){
    		    // we haven't done one in 4 hrs so do one 
    		    // but wait a little bit first to not lag browser start
    		    setTimeout(
    			function(){
    			    _self.sync();
    			}
    			, 5 * 60 * 1000); // 5 minutes 
		}
	    }
	    setInterval(function(){_self.sync()}, 4 * 3600 * 1000);  // 4hrs
	    setInterval(function(){_self.getNotifications()}, 4.2 * 3600 * 1000);
	});    
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

    saveOptions: function(request){
	var _self = this;
	var campaigns = _self.uniqueArray(request.campaigns.sort());
	if(campaigns.join(',') != _self.campaigns.join(',')){
	    _self.lsSet('campaigns',JSON.stringify(campaigns));
	    _self.campaigns = campaigns;
	    _self.resetDB( function(){ _self.sync() });
	}
	if(request.options.opt_popD != _self.opt_popD){
	    _self.opt_popD = request.options.opt_popD;
	    _self.lsSet('opt_popD',_self.opt_popD);
	}
    },

    getSubscribed: function(){
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
    
    sendOptions: function(callback){
	var _self = this;
	var ret = { campaigns: _self.campaigns, options: {opt_popD: _self.opt_popD }};
	_self.getAvailableCampaigns(
	    function(x){ 
		ret.availableCampaigns = [];
		for(var z in x){
		    ret.availableCampaigns.push(x[z]);
		}
		_self.getAvailableActions(
		    function(y){ 
			ret.availableActions = y;
			callback(ret);
		    })});
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

    fetchMetaDeactivated: function(callback){
	var _self = this;
	var metaDeact = parseInt(_self.lsGet('metadea')) || parseInt(_self.lsGet('metaseq')) || 0;
	_self.getJSON(_self.metaDeactivatedUrl, 
		      {startkey: metaDeact,
		       //rando: Math.random() // remove me, pierces cache
		      } ,
		      function(data){
			  var rows = data.rows;
			  if(rows.length > 0){
			      for(var x = 0; x < rows.length; x++){
				  _self.db.thing.remove(rows[x].id).done();
			      }
			      _self.lsSet('metadea', rows[rows.length -1].key);
			  }
			  if(typeof callback == 'function')
			      callback();			  
			  setTimeout(function(){_self.getSubscribed();},500);
		      });
    },
    
    fetchMetaData: function(callback){
	var _self = this;
	var metaSeq = parseInt(_self.lsGet('metaseq')) || 0;
	_self.getJSON(_self.metaUrl,
		  { include_docs: true,
		    startkey: metaSeq,
		    //rando: Math.random() // remove me, pierces cache 
		  },		  
		  function(data){
		      var rows = data.rows;
		      if(rows.length > 0){
			  var insert = rows.map( function(x){ return x.doc; } );
			  var req = _self.db.thing.add(insert);
			  req.done(
		    	      function(){
		    		  _self.lsSet('metaseq', rows[rows.length -1].key + 1);
		    		  _self.fetchMetaDeactivated(callback);
		    	      }
			  );
			  req.fail(function(e) {
		    	      // there was a insert problem 
			      console.error('fetchMetaData fail',e);
			  });
		      } else {
			  _self.fetchMetaDeactivated(callback);
	    	      }		      
	    });
    },
    
    fetchCampaignDeactivated: function(campaign){
	var _self = this;
	var campDeact = parseInt(_self.lsGet('dea' + campaign)) || parseInt(_self.lsGet('seq' + campaign)) || 0;
	_self.getJSON(_self.deactivateUrl, 
		      {startkey: JSON.stringify([ campaign, campDeact ]),
		       endkey: JSON.stringify([ campaign, {} ]),
		       //rando: Math.random() // remove me, pierces cache
		      } ,
		      function(data){
			  var rows = data.rows, req;
			  if(rows.length > 0){
			      for(var x = 0; x < rows.length; x++){
				  req = _self.db.thing.remove(rows[x].id);
				  req.fail(function(x){
				      _self.debug >= 4 && console.log('fetchCampaignDeactivated fail',x)});
				  req.done(function(x){
				      _self.debug >= 3 && console.log('fetchCampaignDeactivated succeed',x)});
			      }
			      _self.lsSet('dea' + campaign, rows[rows.length -1].key[1] + 1);
			  }});		  
    },

    fetchCampaignData: function(campaign){
	var _self = this;
	var campSeq = parseInt(_self.lsGet('seq' + campaign)) || 0;
	_self.getJSON(_self.dataUrl, 
		      {include_docs: true,
		       startkey: JSON.stringify([ campaign, campSeq ]),
		       endkey: JSON.stringify([ campaign, {} ]),
		       //rando: Math.random() // remove me, pierces cache
		      } ,
		      function(data){
			  var rows = data.rows;
			  if(rows.length > 0){
			      var insert = rows.map( function(x){ return x.doc } );
		      	      req = _self.db.thing.add(insert);
		      	      req.done(
				  function(){
		      		      _self.lsSet('seq' + campaign, rows[rows.length -1].key[1] + 1);
		      		      _self.fetchCampaignDeactivated(campaign);
				  }
		      	      );
		      	      req.fail(function(e,x) {
		      		  // there was a insert problem 
		      	      });
			  } else {
		      	      _self.fetchCampaignDeactivated(campaign);
			  }});
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
	    switch(_self.popD){
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
	_self.popD = _self.lsGet('opt_popD');
    },
    
    sendNotification: function(title,message){
	notifications.notify(
	    { title: title
	      , message: message
	      , iconUrl: 'icons/tc-64.png'
	      , onClick: function(x){ 
	          tabs.open(data.url('options.html'));
	      }});
    },
    
    getNotifications: function(){
	var _self = this;
	var lnt = new Date(_self.lsGet('lastnotifytime')||0);
	var now = new Date;
	if(lnt){
	    if(now - lnt > 7 * 24 * 3600 * 1000){  // one week
		_self.checkOldVersion();
		_self.db.thing.query('type').only('notification').execute().done(
		    function(results){
			var result;
			for(var i in results){
			    result = results[i];
			    if(result.notification_date >= lnt.toJSON()){
				_self.sendNotification(result._id,result.title,result.text);
			    }
			}
			_self.lsSet('lastnotifytime',now.toJSON());
		    }
		);
	    }
	} else {	
	    _self.lsSet('lastnotifytime',now);
	}
    },
    
    checkOldVersion: function(){	
	var _self = this, vt =_self.getVersionTime(), now = new Date, currentVersion = s.version;
	if(vt && now - vt > (1000 * 3600 * 24 * 30)){
	    // its been a month so lets check    
	    _self.getJSON(_self.versionURL,
			  function(results){
			      var results = response.json;
			      if(results.releaseDate - vt > 1000 * 3600 * 24 * 14 && results.version != currentVersion){
				  _self.sendNotification("New Version Available","A new version is available and the one installed is more than 2 weeks out of date");
			      }});
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

	var newCamps = ['congress','climatecounts','effback','politifact','naacp','whoprofits','ciw', 'johnoliver'];
	[ 'opt_rush','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ].forEach(
	    function(o){
		if(_self.lsGet(o) != 0){
		    newCamps.push(o.replace('opt_',''));
		}
		_self.lsRm(o);
	    });
	_self.lsSet('campaigns', JSON.stringify(newCamps));    
	_self.getSubscribed();
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
	var _self = this, j, ret = null;
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

function openOptions(){
    var url = "options.html";
    tabs.open(data.url(url));
}
function openUpdate(){
    var url = "options.html?update";
    tabs.open(data.url(url));
}
function openInstall(){
    var url = "options.html?install";
    tabs.open(data.url(url));
}

pageMod.PageMod(
    { include:[ "resource://*" ],
      attachTo: "top",
      contentScriptWhen:  'ready',
      contentScriptFile: [ data.url('jquery-2.0.3.min.js'),
			   data.url('options.js') ],
      onAttach: function(worker){
	  worker.on('message', function(request){
	      if(request.kind == 'sendOptions'){
		  tc.sendOptions(
		      function(r){
			  worker.postMessage(r);
		      }
		  );
	      } else if(request.kind == 'saveOptions'){
		  tc.saveOptions(request);
 	      }
	  });
      }
    }
);

pageMod.PageMod({
    include : ["http://*","https://*"],
    exclude : ["*.adsonar.com"
	       ,"*.msn.com"
	       ,"*.doubleclick.net"
	       ,"*.overture.com"
	      ],
    attachTo: "top",
    contentStyleFile: data.url("jquery-ui.css"),
    contentScriptWhen:  'end',
    contentScriptFile: [
	data.url('jquery-2.0.3.min.js')
	,data.url('jquery-ui-1.9.2.custom.min.js')
	,data.url('ejs_production.js') 
	,data.url('mutation-summary.js')
	,data.url('jquery.mutation-summary.js')
	,data.url('utils.js')
	,data.url('reverse.js')
	,data.url("bing-search.js")
	,data.url("congress.js")
	,data.url("duckduckgo.js")
	,data.url("expedia.js")
	,data.url("facebook.js")
	,data.url("google-maps.js")
	,data.url("google-place-page.js")
	,data.url("google-search.js")
	,data.url("hcom.js")
	,data.url("imdb.js")
	,data.url("netflix.js")
	,data.url("rotten.js")
	,data.url("kayak.js")
	,data.url("orbitz.js")
	,data.url("priceline.js")
	,data.url("tripadvisor.js")
	,data.url("twitter.js")
	,data.url("wikipedia.js")
	,data.url("yahoo-search.js")
	,data.url("yelp.js")
    ],
    onAttach: function(worker){
	tabWorkers[worker.tab.id] = worker;
	worker.on('message', function(request){
	    if(request.handle){
		tc.lookup(request.handle,request, function(r){ worker.postMessage(r) });
	    } else {
 		console.log("couldn't get a handle",request);
	    }
	});
    }
});		

// pageMod.PageMod({
//     include : ["*.adsonar.com"
// 	       ,"*.msn.com"
// 	       ,"*.doubleclick.net"
// 	       ,"*.overture.com"
// 	      ],
//     attachTo: "frame",
//     contentStyleFile: data.url("jquery-ui.css"),
//     contentScriptWhen:  'ready',
//     contentScriptFile: [
// 	data.url('jquery-2.0.3.min.js')
// 	,data.url('jquery-ui-1.9.2.custom.min.js')
// 	,data.url('ejs_production.js') 
// 	,data.url('utils.js') 
// 	,data.url('iframe.js') 
//     ],
//     onAttach: function(worker){
// 	tabWorkers[worker.tab.id] = worker;
// 	worker.on('message', function(request){
//          if(request.handle){
// 		tc.lookup(request.handle,request, function(r){ worker.postMessage(r) });
// 	    } else {
//  		console.log("couldn't get a handle",request);
// 	    }
// 	});
//     }
// });		

var action_button = ui.ActionButton({
  id: "tcOptions",
  label: "thinkContext Options",
  icon: "./tc-16.png",
  onClick: function(state) {
      tabs.open(data.url('options.html'));
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
    var handle = new urlHandle(tab.url);
    if(handle.handle){
	tc.lookup(handle.handle,
		  { kind: 'link',
		    handle: handle.handle		    
		  },
		  function(r){
		      var results = r.results;
		      var icon,result;
		      for(var i in results){
			  result = results[i];
			  for(var j in result.campaigns){
			      campaign = result.campaigns[j];
			      if(campaign.status == 'D' || ! campaign.action || typeof campaign.action != 'object')
				  continue;
			      if(icon){
				  icon = defaultIcon;
			      } else {
				  icon = campaign.action.icon;
			      }
			  }
		      }
		      button.setImage(icon,tab.url);
		      button.setVisibility(true,tab.url);
		  });
    }
};

var buttonTabClose = function(tab){
    delete tabWorkers[tab.id];
};

tabs.on('ready', buttonTab);
tabs.on('activate', buttonTab);
tabs.on('close',buttonTabClose);

urlHandle = function(url){
    //tc.debug >= 2 && 
    url = url.trim();
    if(!url.match(/^https?:\/\/\w/))
	return null;
    this.url = url;
    var m, sp = url.split('/');
    var domain = sp[2].toLowerCase().replace(/^[w0-9]+\./,'');
    var path = sp.slice(3).join('/');
    var query = path.split('?')[1];
    this.domain = domain;
    this.path = path;
    this.query = query;
    
    if(domain == 'twitter.com' && (m = path.match(/^(\w+)/))){
	this.kind = 'twitter';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'tripadvisor.com' && (m = path.match(/_Review-(g[0-9]+-d[0-9]+)/))){
	this.kind = 'tripadvisor';
	this.hval = m[1];
    } else if(domain == 'facebook.com' && ((m = path.match(/pages.*\/([0-9]{5,20})/)) || (m = path.match(/^([^\?\/\#]+)/)))){
	this.kind = 'facebook';
	this.hval = m[1].toLowerCase();
    } else if(domain == 'yelp.com' && (m = path.match(/biz\/([\w\-]+)/))){
	this.kind = 'yelp';
	this.hval = m[1];
    } else if(domain == 'hotels.com' && (m = path.match(/ho([0-9]+)/))){
	this.kind = 'hcom';
	this.hval = m[1];
    } else if(domain == 'orbitz.com' && (m = path.match(/(h[0-9]+)/))){
	this.kind = 'orbitz';
	this.hval = m[1];
    } else if(domain == 'expedia.com' && (m = path.match(/(h[0-9]+)/))){
	this.kind = 'expedia';
	this.hval = m[1];
    } else if(domain == 'kayak.com' && (m = path.match(/([0-9]+).ksp/))){
	this.kind = 'kayak';
	this.hval = m[1];
    } else if(domain == 'priceline.com' && (m = path.match(/-([0-9]{5,10})-/))){
	this.kind = 'priceline';
	this.hval = m[1];
    } else if(domain == 'imdb.com' && (m = path.match(/title\/(tt[0-9]+)/))){
	this.kind = 'imdb';
	this.hval = m[1];
    } else if(domain.match(/\.?netflix\.com$/) && (m = path.match(/WiMovie\/([0-9]+)/) || (query && (m = query.match(/movieid=([0-9]+)/))) || (m = path.match(/^Movie\/.*\/([0-9]+)$/)))){
	this.kind = 'netflix';
	this.hval = m[1];
    } else if(domain.match(/\.?rottentomatoes\.com$/) && (m = path.match(/m\/([^\/]+)/))){
	this.kind = 'rt';
	this.hval = m[1];
    } else if(domain == 'plus.google.com' && ((m = path.match(/^([0-9]+)/)) || (m = path.match('(\+\w+)')))){
	this.kind = 'gplus';
	this.hval = m[1];
    } else if(domain == 'en.wikipedia.org' && (m = path.match(/wiki\/([\w\-]+)/))){
	this.kind = 'wiki'
	this.hval = m[1];
    } else {
	this.kind = 'domain';
	this.hval = domain + '/' + path;
    }
    if(this.kind && this.hval)
	this.handle = this.kind + ':' + this.hval;
    else 
    	return null;
}

