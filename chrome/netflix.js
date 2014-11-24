if (window.top === window && !tc.found && document.domain.match(/(^|\.)netflix\.com$/)) {
    tc.found = true;
    var h = new tc.urlHandle(document.URL);
    var selector;

    if(h.kind == 'netflix'){
	selector = "a.playLink:not([href*='"+h.hval+"'])";
    } else {
	selector = "a.playLink";
    }
    
    tc.registerResponse('nfLink',tc.onLink);
    $(selector).not('[tcid]').map(
	function(){
	    var h = new tc.urlHandle(this.href);
	    if(h && h.handle){
		var r = tc.random();	    
		this.setAttribute('tcid',r);
		tc.sendMessage({
		    kind: 'link'
		    , tcid: r
		    , handle: h.handle});
	    }
	});
}