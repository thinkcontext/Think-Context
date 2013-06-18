sub = {

tc.registerResponse('link',function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.resultPrev(this,request.key,request.data);});
});

// result link - could be a place link else look up the result link
$('div#web > ol h3 > a').map(
    function(){
    	if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
	    var sid = "gs" + tc.random();
	    this.setAttribute("sid",sid);
	    var yid_regex = new RegExp('local.yahoo.com/info-([0-9]+)');
    	    yid_res = yid_regex.exec(this.href);
	    if(yid_res && yid_res[1]){
		var yid = yid_res[1];
		tc.sendMessage({'kind': 'place'
				, 'sid': sid
				, 'type': 'yahoo'
				, 'key': yid  });
	    } else {
		this.setAttribute("sid",sid);
		tc.sendMessage({'kind': 'link'
     				, 'sid': sid
     				, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	}
    });

//tc.registerResponse('reversehome', tc.reverseResponse);
//tc.reverseExamine();
