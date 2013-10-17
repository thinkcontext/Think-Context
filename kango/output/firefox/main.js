function Store(name){
    this.name = name;
    // check if already exists, if not create
    // and version is correct, if not, delete all old keys, re-init
    // check last update time, update if necessary
}
Store.prototype = {

    setItem: function(key,val){
	kango.storage.setItem(this.name + '-' + key,val);
    },

    getItem: function(key){
	return kango.storage.getItem(this.name + '-' + key);
    },
    removeItem: function(key){
	return kango.storage.removeItem(this.name + '-' + key);
    }
}

function MyExtension() {
    var self = this; // why is this here?
    // TODO check first run, update, outdated
    this.urlPrefix = 'http://localhost:5984/domain/_design/think/_view';

    this.campaigns = ['rushBoycott','bcorp']; // make this a setting
    this.templates = 	this.templates = {
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
	}; // preload templates, store as single document

    var templates = this.templates;
    this.domain = new Store('domain');

//    this.load();

    // open for business, listen for requests
    kango.addMessageListener('content2background'
			     , function(event){
				 var data = event.data, reply;
				 switch(data.kind){
				 case 'domain':
				     reply = self.lookupDomain(data);
				     console.log(reply);
				     
				     if(reply){
					 reply.request = data;
					 reply.templates = {};
					 for(var c in reply.campaigns){
					     console.log(c);
					     reply.templates[c] = templates[c];
					 }
					 event.target.dispatchMessage(data.source,reply);
				     }
				     break;
				 }
			     });
 
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
}

MyExtension.prototype = {
    _onCommand: function(){ console.log('foo');},
    loadTemplates: function(){
//	this.templates = kango.storage.getItem('templates').templates;
    },

    load: function(){
	var self = this;
	console.log('load');
	$.getJSON(this.urlPrefix + '/loadByCampaign'
		  ,function(data){
		      var k, rows = data.rows;
		      if(rows.length > 0){
			  kango.storage.clear(); // only clear if there's data
			  var maxTime = '2000-01-01 01:01:01 -0400';
			  for(var k in rows){
			      kango.storage.setItem(rows[k].id,rows[k].value);
			      if(rows[k].value.date_added > maxTime)
				  maxTime = rows[k].value.date_added;
			  }
			  kango.storage.setItem('metaTime',maxTime);
			  self.loadTemplates();
		      }
		  });
    },
    update: function(){
	var d = new Date, self = this;
	$.getJSON(this.urlPrefix + '/updatebycampaign?startkey="' + kango.storage.getItem('metaTime') + '"&endkey="'+ d.toJSON()+'"'
		  ,function(data){
		      var k, rows = data.rows, key;
		      var maxTime = kango.storage.getItem('metaTime');
		      for(var k in rows){
			  key = rows[k].id
			  switch(rows[k].value.status = 'D'){
			  case 'D':
			      kango.storage.removeItem(key);
			      break;
			  case 'A':
			      kango.storage.setItem(key,rows[k].value);
			      break;
			  default:
			      continue;
			  }
			  if(rows[k].value.date_modified > maxTime)
			      maxTime = rows[k].value.date_modified;
		      }
		      kango.storage.setItem('metaTime',maxTime);
		      self.loadTemplates();		      
		  });
    },
    lookupDomain: function(rdata){
	console.log(rdata);
	var d = this.getDomain(rdata.key);
	console.log(d);
	if(d){
	    return this.domain.getItem(d);
	}
    },
    getDomain: function(d){
	var m = d.match(/^(www\.)?([^\/]+\.[^\/]+)/);
	console.log(d,m);
	if(m.length == 3){
	   return m[2].toLowerCase();
	}
    }
    
};

var extension = new MyExtension();

