function MyExtension() {
    var self = this;
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
    
    // $.getJSON('http://localhost:5984/domain/_design/think/_view/bydomain'
    // 	      ,function(data){
    // 		  console.log(data.total_rows);
    // 	      });
    self._replicate();
    console.log(self.db);
    
}

MyExtension.prototype = {
    
    _onCommand: function() {
	kango.browser.tabs.create({url: 'http://kangoextensions.com/'});
    }
    
    , db: new PouchDB('domain')
    , remoteCouch: 'http://localhost:5984/domain'
    , _replicate: function(){
	this.db.replicate.from(this.remoteCouch);
    }
};

var extension = new MyExtension();
