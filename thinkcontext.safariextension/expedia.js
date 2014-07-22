if (window.top === window && !tc.found && document.domain.match(/(^|\.)expedia\.com$/)) {
    tc.found = true;
    
    if(document.location.pathname == '/Hotel-Search'){
	$("article.hotel > a[href*='.h']").not('[tcid]').map(
	    function(){
		var h = new tc.urlHandle(this.href);
		if(h){
		    var r = tc.random();
		    this.setAttribute('tcid', r);
		    tc.sendMessage({
			kind: h.kind
			, tcid: r
			, handle: h.handle});
		}
	    });
    }
}
