if ( !tc.found && document.domain.match(/(^|\.)yahoo\.com|(^|\.)goodsearch\.com$/)) {
    tc.found = true;
    tc.handleExamine('div#web > ol h3 > a'
		     , 'yahoo-search');
    
    // ads
    
    tc.handleExamine('div.ads ul.spns li.sitelink:has(div > a) em > a'
		     , null
		     , function(x){return x.textContent}
		     , null //function(x){return x.parentElement.children[0].children[0];}
		    );
}
