function Store(name){
    this.name = name;
    this.urlPrefix = 'http://localhost:5984/domain/_design/think/_view/bydomain';
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

    deleteKeys: function(){
	var r = RegExp('^' + this.name + '-')
	for(var k in kango.storage.getKeys){
	    if(r.test(k)){
		kango.storage.removeItem(k);
	    }
	}
    },
}


function MyExtension() {
    var self = this;
    // check first run, update, outdated
    self.campaigns = ['stoprush','bcorp']; // make this a setting
    self.templates = {}; // preload templates, store as single document

    self.domain = new Store('domain');

    // open for business, listen for requests
    kango.addMessageListener('domain'
			     , function(event){
				 console.log(event);
			     });
    

    // open local meta Store
    // iterate through metastore for other Stores

    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
    
    
}

MyExtension.prototype = {
    
    _onCommand: function() {
	kango.browser.tabs.create({url: 'http://kangoextensions.com/'});
    },
    load: function(){
	$.getJSON(this.urlPrefix
		  ,function(data){
		      console.log(data.total_rows);
		  });	
    },
    update: function(){

    }

};

var extension = new MyExtension();
