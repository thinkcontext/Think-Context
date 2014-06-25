if (window.top === window && !tc.found && document.domain.match(/(^|\.)mail\.google\.com$/)) {
    tc.found = true;
    tc.gmail = {};
    
    tc.gmail.pageExamine = function(){
	tc.searchLinkExam("a[href*='googleadservices.com/pagead/aclk'].vd, div.aBD a.mr"
			  , 'gmail'
			  , null
			  , function(x){return x.textContent});		
    }
    
    var $observerSummaryRoot = $("body");
    tc.gmail.summaryCallback = function(summaries){
	$observerSummaryRoot.mutationSummary("disconnect");
	tc.gmail.doOb();
    }
    
    tc.gmail.doOb = function(){
	tc.gmail.pageExamine();
	window.setTimeout(tc.gmail.pageExamine,1000);    
	window.setTimeout(tc.gmail.observe,500);
    }
    
    tc.gmail.observe = function(){
	$observerSummaryRoot.mutationSummary("connect"
					     , summaryCallback
					     , [{element: 'div.adC'}]
					    );
    }
    
    tc.gmail.doOb();
}
