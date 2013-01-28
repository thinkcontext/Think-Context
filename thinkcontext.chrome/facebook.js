tc.registerResponse('link', function(request){
    $("[sid=" + request.sid +"]").map(function(){
	tc.sub[request.data.func](this,request.key,request.data);});
});

$('div.adInfo a').map(
    function(){
	var sid = "gs" + Math.floor(Math.random() * 100000);
	this.setAttribute("sid",sid);
	tc.sendMessage({'kind': 'link'
     			, 'sid': sid
     			, 'key': tc.sigURL(this.innerText).replace(/https?:\/\//,'').replace(/\/$/,'') });
	
    });
