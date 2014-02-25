console.log('twitter');

tc.popSend();
var $observerSummaryRoot = $("div#page-container");

function summaryCallback(summaries){
    console.log('disconnect');
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    console.log('doob');
    examine();
    window.setTimeout(observe,500);
    window.setTimeout(examine,1000);
}


function observe(){
    console.log('observe');
    $observerSummaryRoot.mutationSummary("connect"
					 , summaryCallback
					 , [{ element:"div" }]);
}


function examine(){
    console.log('examine');
    tc.simpleHandleExamine("div.profile-card-inner[data-screen-name]");
    var arr = tc.uniqueArray(
	$('a.js-user-profile-link').not('[tcid]').map(
	    function(){
		this.tcid = 1;	
		if(m = this.href.match(/https?:\/\/twitter\.com\/(\w+)$/)){
		    return m[1]
		}
	    }).toArray());
    for(var i in arr){
	var th = arr[i];
	console.log('twitter handle',th);	
	tc.sendMessage({
	    kind: 'twitter'
	    , origTwitter: th
	    , handle: 'twitter:' + th.toLowerCase()});
    }
}

doOb();
