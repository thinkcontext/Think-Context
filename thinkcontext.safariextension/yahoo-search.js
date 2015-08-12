if ( window === window.top && !tc.found && document.domain.match(/(^|\.)yahoo\.com|(^|\.)goodsearch\.com$/)) {
    tc.found = true;
    tc.handleExamine('div#web > ol h3 + div span'
		     , null
		     , function(x){return 'http://' + x.textContent;}
		     , function(x){ return x.parentElement.parentElement.childNodes[0];});
    
    // ads
    
    tc.handleExamine("div#main > div > ol h3 + div a:last-of-type, div#right ol h3 + div a:last-of-type"
		     , null
		     , function(x){ return 'http://' + x.textContent;}
		     , function(x){ return x.parentElement.parentElement.childNodes[0];});
}
