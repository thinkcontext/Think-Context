
// tc.registerResponse('bing-text'
// 		    ,function(request){
// 			sub.insertSubvertisements(request);
// 		    });
tc.registerResponse('link',
		    function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    tc.resultPrev(this,request.key,request.data);});
		    });

tc.registerResponse('place'
		    , function(request){
			$("[sid=" + request.sid +"]").map(function(){
			    tc.place(this,request.key,request.data);});
		    });

// // query text
// var qt =  $("input[name=q]").val();
// //location
// var loc = $('ul.sw_tn > li:nth-child(3) > a').text()
// tc.sendMessage(
//      {'kind' : "bing-text"
//       , 'key' : qt
//       , 'location' : loc
//      });

// result link
$('div#results  li  div  div  h3  a').map(
    function(){
	var sid = "gs" + tc.random();
	this.setAttribute("sid",sid);
	tc.sendMessage({'kind': 'link'
     			, 'sid': sid
     			, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });

    }
);

// lid short link
$("li.hip_htlnm a[href*='lid=']").map(
    	function(){
    	    if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
		var lid_regex = new RegExp('lid=([a-zA-Z0-9]+)');
    		lid_res = lid_regex.exec(this.href);
		if(lid_res[1]){
		    var lid = lid_res[1];
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'place'
				    ,'type': 'bing'
				    , 'sid': sid
				    , 'key': lid  });
		}
	    }
	}
);

// lid long link
$("div h2 div a[href*='lid=']").map(
    	function(){
	    tc.debug("lid long link");
    	    if(!this.previousSibling || !this.previousSibling.getAttribute || !this.previousSibling.getAttribute('subv')){
		var lid_regex = new RegExp('lid=([a-zA-Z0-9]+)');
    		lid_res = lid_regex.exec(this.href);
		tc.debug(lid_res);
		if(lid_res[1]){
		    var lid = lid_res[1];
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'place'
				    ,'type': 'bing'
				    , 'sid': sid
				    , 'key': lid  });
		}
	    }
	}
);
tc.registerResponse('reversehome', tc.reverseResponse);
tc.reverseExamine();
