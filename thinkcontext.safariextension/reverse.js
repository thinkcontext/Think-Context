if (window.top === window) {
    if(! (/^http(s)?:\/\/www.google.com\//.test(document.URL)
	  || /^http(s)?:\/\/maps.google.com\/maps\/place/.test(document.URL)
	  || /^http(s)?:\/\/bing.google.com\/search/.test(document.URL)
	  || /^http(s)?:\/\/search.yahoo.com\/search/.test(document.URL)
	  || document.domain.match('google.com$')
	  || document.domain.match('facebook.com$')
	  || document.domain.match('twitter.com$')
	  || document.baseURI.match(/^safari-extension/)
	 ) || document.domain == 'news.google.com'
      ){    
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

	$("a[href*='googleadservices.com/pagead/aclk']").not('a[sid]').map(
	    function(){
		if(!this.textContent.match(' ')){
		    var sid = "gs" + tc.random();
		    this.setAttribute("sid",sid);
		    tc.sendMessage({'kind': 'link'
     				    , 'sid': sid
     				    , 'key': tc.sigURL(this.textContent).replace(/https?:\/\//,'').replace(/\/$/,'') });
		}
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
	safari.self.addEventListener("message",tc.onResponse, false);
	
    }
}
