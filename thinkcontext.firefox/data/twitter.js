if (window.frameElement === null){
    tc.twit = {};
    tc.reverseResponseTwit = 1;
    tc.registerResponse('link'
			,function(request){
			    $("[sid=" + request.sid +"]").map(function(){
				tc.resultPrev(this,request.key,request.data);});
			});
    
    tc.registerResponse('reversehome', tc.reverseResponse);
    tc.registerResponse('urlresolve', 
			function(response){
			    $("a[tcurl='" + response.key + "']").map(
				function(){
				    this.setAttribute("tcurl",response.url);
				    tc.sendMessage({ kind: 'reversehome'
						     , type: 'twitter'
						     , key: [ tc.sigURL(response.url)]});
				    var sid = "gs" + tc.random();
				    this.setAttribute("sid",sid);
				    tc.sendMessage({'kind': 'link'
     						    , 'sid': sid
     						    , 'key': tc.sigURL(response.url).replace(/https?:\/\//,'').replace(/\/$/,'') });
				});
			});
    
    tc.twit.expandURL = function () {
	$('a.twitter-timeline-link').filter(':visible').map(
	    function() {
		var element = this;
		var url = element.getAttribute("data-expanded-url");
		if(!element.getAttribute('tcurl') && url){
		    var newUrl;
		    if(newUrl = resolveMap(url)){
			element.setAttribute('tcurl',newUrl); // don't check an element more than once
			tc.sendMessage({key:newUrl, kind:'urlresolve'});
		    } else {
			element.setAttribute('tcurl',url); // don't check an element more than once
			tc.sendMessage({'kind':'reversehome'
    					, 'type':'twitter'
    					, 'key': [tc.sigURL(url)]}
    				      );
			var sid = "gs" + tc.random();
			this.setAttribute("sid",sid);
			tc.sendMessage({'kind': 'link'
     					, 'sid': sid
     					, 'key': tc.sigURL(this.href).replace(/https?:\/\//,'').replace(/\/$/,'') });
			
		    }
		}
	    });    
    }
    
    tc.twit.divClick = function () {
	window.setTimeout(expandURL, 1000);
    }
    
    tc.twit.newTweetsBar = function() {
	var div = document.getElementsByClassName("new-tweets-bar")[0];
	if(typeof div !== "undefined") {
	    div.addEventListener("click", tc.twit.divClick, false);
	}
    }
    
    tc.twit.onScroll = function(e) {
	if(tc.twit.scrollId) {
	    window.clearTimeout(scrollId);
	}
	scrollId = window.setTimeout(function() {
	    if(tc.twit.docHeight < document.getElementById("stream-items-id").scrollHeight) {
		tc.twit.expandURL();      
	    }
	}, 2000);
    }
    
    tc.twit.start = function() {
	if(document.getElementById("stream-items-id")) {
	    window.clearTimeout(tc.twit.startId);
	    docHeight = document.getElementById("stream-items-id").scrollHeight;
	    tc.twit.expandURL();
	}
    }
    
    window.addEventListener("load", function(e) {
	tc.twit.start();
	tc.twit.startId = window.setInterval(tc.twit.start, 1000);
    }, false);
    window.setInterval(tc.twit.newTweetsBar, 1000);
    window.addEventListener("scroll", tc.twit.onScroll, false);

}
