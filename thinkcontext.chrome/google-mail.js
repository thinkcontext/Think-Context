tc.registerResponse('link'
		    ,function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    tc.resultPrev(this,request.key,request.data);})
		    });

function pageExamine(){
$("a[href*='googleadservices.com/pagead/aclk']").not('a[sid]').map(
    function(){
	var m = this.href.match(/adurl=(http[^\&\"]+)/)
	if(m && m[1]){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    console.log(m[1]);
	    tc.sendMessage({'kind': 'link'
     			    , 'sid': sid
     			    , 'key': tc.sigURL(m[1]).replace(/https?:\/\//,'').replace(/\/$/,'') });
	}
    });
}
pageExamine();
window.setInterval(pageExamine,750);
