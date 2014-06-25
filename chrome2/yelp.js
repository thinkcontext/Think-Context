if (window.top === window && !tc.found && document.domain.match(/(^|\.)expedia\.com$/)) {
    tc.found = true;
    tc.yelp = {};
    var $observerSummaryRoot = $("body");
    
    tc.yelp.summaryCallback = function(summaries){
	$observerSummaryRoot.mutationSummary("disconnect");
	tc.yelp.doOb();
    }
    
    tc.yelp.doOb = function(){
	tc.yelp.examine();
	window.setTimeout(tc.yelp.observe,500);
	window.setTimeout(tc.yelp.examine,1000);
    }
    
    tc.yelp.observe = function(){
	$observerSummaryRoot.mutationSummary("connect"
					     , tc.yelp.summaryCallback
					     , [{ element:"div" }]);
    }
    
    tc.yelp.examine = function(){
	tc.handleExamine('a.biz-name','yelp');
    };
    
    tc.yelp.doOb();
}
