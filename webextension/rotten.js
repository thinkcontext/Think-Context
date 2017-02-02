if (window.top === window && !tc.found && document.domain.match(/(^|\.)rottentomatoes\.com$/)) {
    tc.found = true;
    
    var h = new tc.urlHandle(document.URL);
    if(h.kind == 'rt'){
	tc.handleExamine("a[href*='m/']:not([href*='"+h.hval+"'])",'rt');
    } else {
	tc.handleExamine("a[href*='m/']",'rt');
    }
}
