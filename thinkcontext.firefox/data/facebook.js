if (window.frameElement === null){
tc.facebook = {};
var $observerSummaryRoot = $("body");

function summaryCallback(summaries){
//    console.error('disconnect');
    $observerSummaryRoot.mutationSummary("disconnect");
    doOb();
}

function doOb(){
    tc.facebook.examine();
    window.setTimeout(tc.facebook.observe,500);
    window.setTimeout(tc.facebook.examine,1000);
}

tc.facebook.observe = function(){
    //console.error('observe');
    $observerSummaryRoot.mutationSummary("connect"
					 , summaryCallback
					 , [{ element:"div" }]);
}

tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.resultPrev(this,request.key,request.data);});
});

tc.facebook.examine = function(){
    //console.error('examine');
    $('div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)').not('[sid]').map(
	function(){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    tc.sendMessage({kind: 'link'
     			    , sid: sid
     			    , key: tc.sigURL(this.textContent)});
	    
	});}

doOb();
}
