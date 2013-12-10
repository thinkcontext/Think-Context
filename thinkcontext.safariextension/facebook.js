if (window.top === window) {
    if(document.domain == 'facebook.com' || document.domain == 'www.facebook.com'){
	tc.facebook = {};

	tc.registerResponse('link', function(request){
	    $("[sid=" + request.sid +"]").map(function(){
		tc.resultPrev(this,request.key,request.data);});
	});

	tc.facebook.examine = function(){
	    $('div.adboard_unit div._5fxl').not('[sid]').map(
		function(){
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'link'
     				    , 'sid': sid
     				    , 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
		    
		});}
	
	tc.facebook.examine();
	setInterval(tc.facebook.examine, 1000);
	safari.self.addEventListener("message",tc.onResponse, false);
    }
}
