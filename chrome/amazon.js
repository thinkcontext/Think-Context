if (window.top === window && !tc.found && document.domain.match(/(^|\.)amazon\.com$/)) {
    var rl;

    // search list results
    if(rl  = $("ul.s-result-list li.s-result-item") && rl.length > 0){
	//movies
	rl.has("a:contains('DVD') , a:contains('Instant Video'), a:contains('Blu-ray')").map(function(){
	    var $li = $(this);
	    var title = $li.find("a.s-access-detail-page").text().replace(/\[[^\]]*\]/g,'').trim();
	    var year = $li.find("span.a-color-secondary:first").text();
	    console.log(title,year);	    
	});
    } else if(){
	}
}
