if (window.top === window && !tc.found && document.domain.match(/(^|\.)imdb\.com$/)) {
    tc.found = true;
    
    var h = new tc.urlHandle(document.URL);
    if(h.kind == 'imdb'){
	tc.handleExamine("a[href*='title/tt']:not([href*='"+h.hval+"'])",'imdb');
    } else {
	tc.handleExamine("a[href*='title/tt']",'imdb');
    }
}
