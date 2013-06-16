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

function expandURL() {
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

function divClick() {
  window.setTimeout(expandURL, 1000);
}

function newTweetsBar() {
  var div = document.getElementsByClassName("new-tweets-bar")[0];
  if(typeof div !== "undefined") {
    div.addEventListener("click", divClick, false);
  }
}

function onScroll(e) {
  if(scrollId) {
    window.clearTimeout(scrollId);
  }
  scrollId = window.setTimeout(function() {
    if(docHeight < document.getElementById("stream-items-id").scrollHeight) {
      expandURL();      
    }
  }, 2000);
}

function start() {
  if(document.getElementById("stream-items-id")) {
      window.clearTimeout(startId);
    docHeight = document.getElementById("stream-items-id").scrollHeight;
    expandURL();
  }
}

var scrollId;
var docHeight;
var startId;

window.addEventListener("load", function(e) {
    start();
    startId = window.setInterval(start, 1000);
}, false);
window.setInterval(newTweetsBar, 1000);
window.addEventListener("scroll", onScroll, false);

