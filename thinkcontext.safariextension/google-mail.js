if (window.top === window && document.domain == 'mail.google.com') {
tc.gmail = {};

tc.gmail.pageExamine = function(){
    //console.log('examine');
    tc.searchLinkExam("a[href*='googleadservices.com/pagead/aclk'].vd, div.aBD a.mr"
		      , 'gmail'
		      , null
		      , function(x){return x.textContent});		
}

var $observerSummaryRoot = $("body");
function summaryCallback(summaries){
    //console.log('disconnect');
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    tc.gmail.pageExamine();
    window.setTimeout(tc.gmail.pageExamine,1000);    
    window.setTimeout(tc.gmail.observe,500);
}

tc.gmail.observe = function(){
    //console.log('observe');
    $observerSummaryRoot.mutationSummary("connect"
					 , summaryCallback
					 , [{element: 'div'}]
					);
}

doOb();
    safari.self.addEventListener("message",tc.onResponse, false);
}
