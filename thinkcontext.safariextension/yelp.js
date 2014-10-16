if (window.top === window && !tc.found && document.domain.match(/(^|\.)yelp\.com$/)) {
    tc.debug == 2 && console.log("yelp");
    tc.found = true;
    tc.yelp = {};
    tc.yelp.$observerSummaryRoot = $("body");
    
    tc.yelp.summaryCallback = function(summaries){
	tc.yelp.$observerSummaryRoot.mutationSummary("disconnect");
	tc.yelp.doOb();
    }
    
    tc.yelp.doOb = function(){
	tc.yelp.examine();
	window.setTimeout(tc.yelp.observe,500);
	window.setTimeout(tc.yelp.examine,1000);
    }
    
    tc.yelp.observe = function(){
	tc.yelp.$observerSummaryRoot.mutationSummary("connect"
					     , tc.yelp.summaryCallback
					     , [{ element:"div" }]);
    }
    
    tc.yelp.examine = function(){
	tc.handleExamine('a.biz-name','yelp');
    };
    
    tc.yelp.doOb();
}
