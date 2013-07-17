function MyExtension() {
    var self = this;
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
    
    $.getJSON('http://localhost:5984/domain/_design/think/_view/bydomain'
	      ,function(data){
		  console.log(data.total_rows);
	      });

}

MyExtension.prototype = {

    _onCommand: function() {
	kango.browser.tabs.create({url: 'http://kangoextensions.com/'});
    }
};

var extension = new MyExtension();
