if (window.frameElement === null){
    if(!( document.domain.match('google.com$') 
	  || document.domain.match('facebook.com$')
	  || document.domain.match('search.yahoo.com$')
	  || document.domain.match('goodsearch.com$')
	  || document.domain.match('bing.com$')
	)
      ){    
	
	tc.reverse = {};
	
	tc.registerResponse('link',
			    function(request){
				if(request.pop == 1){
				    tc.resultPop(request);
				} else {
				    $("[sid=" + request.sid +"]").map(function(){
					tc.resultPrev(this,request.key,request.data);});
				}
			    }
			   );
	tc.sendMessage(
	    {kind: 'link'
	     , pop: 1
	     , key: tc.sigURL(document.baseURI).replace(/https?:\/\//,'').replace(/\/$/,'')
	    });

	$("a[href*='shlinks.industrybrains.com']").not('a[sid]').map(
	    function(){
		if(!this.textContent.match(' ')){
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'link'
     				    , 'sid': sid
     				    , 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
		}
	    });

    $("a[href*='googleadservices.com/pagead/aclk']").not('a[sid]').map(
	function(){
	    var m = this.href.match(/adurl=(http[^\&\"]+)/)
	    if(m && m[1]){
		var sid = "gs" + tc.random();
		this.setAttribute("sid",sid);
		tc.sendMessage({'kind': 'link'
     				, 'sid': sid
     				, 'key': tc.sigURL(m[1]).replace(/https?:\/\//,'').replace(/\/$/,'') });
	    }
	});
	// $("object param[value*='adurl%3Dhttp%253A%252F%252Fad.doubleclick.net/click']").map(
	//     function(){
	// 	var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	// 	if(m && m.length == 3)
	// 	    console.log('doubleclick param ' + m[2])
	//     });

	// $("object[flashvars*='click=http%3A%2F%2Fad.doubleclick.net']").map(
	//     function(){
	// 	var m = this.attributes.flashvars.textContent.match(/exitEvents=[^\&]*url%253Ahttp%25253A%2F%2F([^\%]+)/);
	// 	if(m && m.length == 2)
	// 	    console.log('doubleclick object ' + m[1]);
	//     });

    }
}
