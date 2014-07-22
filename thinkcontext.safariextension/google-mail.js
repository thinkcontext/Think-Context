if (window.top === window && !tc.found && document.domain.match(/(^|\.)mail\.google\.com$/)) {
    tc.found = true;
    tc.gmail = {};
    
    tc.gmail.pageExamine = function(){
	tc.handleExamine("a[href*='googleadservices.com/pagead/aclk'].vd, div.aBD a.mr"
			 ,'urlfrag'
			 , function(x){return x.textContent});		
    }
    
    tc.gmail.$observerSummaryRoot = $("body");
    tc.gmail.summaryCallback = function(summaries){
	tc.gmail.$observerSummaryRoot.mutationSummary("disconnect");
	tc.gmail.doOb();
    }
    
    tc.gmail.doOb = function(){
	tc.gmail.pageExamine();
	window.setTimeout(tc.gmail.pageExamine,1000);    
	window.setTimeout(tc.gmail.observe,500);
    }
    
    tc.gmail.observe = function(){
	tc.gmail.$observerSummaryRoot.mutationSummary("connect"
					     , tc.gmail.summaryCallback
					     , [{element: 'div'}]
					    );
    }
    
    $(document).ready(tc.gmail.doOb);
}
