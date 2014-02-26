tc.gmail = {};

tc.gmail.pageExamine = function(){
    tc.searchLinkExam("a[href*='googleadservices.com/pagead/aclk'].vd, div.aBD a.mr"
		      , 'gmail'
		      , null
		      , function(x){return x.textContent});		
}

var $observerSummaryRoot = $("body");
function summaryCallback(summaries){
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
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

doOb();
