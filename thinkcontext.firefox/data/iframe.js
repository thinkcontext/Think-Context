console.log(document.domain);
tc.iframe = {};
tc.iframe.sendReq = function(j){
    var sid = "gs" + tc.random();
    j.setAttribute("sid",sid);
    tc.sendMessage({'kind': 'link'
     		    , 'sid': sid
     		    , 'key': tc.sigURL(j.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
    
};

tc.registerResponse('link',
		    function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    tc.resultPrev(this,request.key,request.data);});
		    }
		   );

if(document.domain.match('adsonar.com')){
    $("p.lnk a").not('a[sid]').map(
	function(){
	    tc.iframe.sendReq(this);
	});
} else if(document.domain.match('msn.com')){
    $('a.AdDisplayUrl').not('a[sid]').map(
	function(){
	    console.log(this);
	    tc.iframe.sendReq(this);
	});
// } else if(document.baseURI.match('ad.doubleclick.net/adi')){
//     $("object param[value*='adurl%3D']").map(
// 	function(){
// 	    console.log(this.value);
// 	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
// 	    if(m && m.length == 3){
// 		console.log('doubleclick param ' + m[2])
// 	    } else {
// 		m = this.value.match(/adurl%3Dhttp(s)?%253a%252f%252f([^\/]+)\//)
// 		if(m && m.length == 3){
// 		console.log('doubleclick param ' + m[2])
// 		}
// 	    }
// 	});
} else if(document.baseURI.match('doubleclick.net/pagead')){
    $("span.adus").not('a[sid]').map(
	function(){
	    tc.iframe.sendReq(this);
	});
} else if(document.domain.match('overture.com')){
    $("div.clsURL").not('a[sid]').map(
	function(){
	    tc.iframe.sendReq(this);
	});
}

