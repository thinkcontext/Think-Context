console.log('twitter');
tc.reverseResponseTwit = 1;
tc.registerResponse('reversehome', tc.reverseResponse);
tc.registerResponse('urlresolve', function(request){
    console.log(request);
});

// setInterval(function(){
//     var urlmap = $('a[data-expanded-url]').map(
// 	function(){
// 	    if(! this.getAttribute('subv'))
// 		return this.getAttribute('data-expanded-url');
// 	});
// //    console.log(urlmap);
//     if(urlmap){
// 	tc.sendMessage({'kind':'reversehome'
// 			, 'type':'twitter'
// 			, 'key': jQuery.makeArray(urlmap)}
// 		      )
//     }
// }
// 	    , 3000);

function httpExpandURI(element) {
    tc.sendMessage({'kind': 'urlresolve'
    		    , 'type': 'twitter'
    		    , 'url': element.getAttribute("data-expanded-url")
    		   });
}

function modify(element, url) {
    element.setAttribute("href", url);
    element.setAttribute("subv", url);

    // tc.sendMessage({'kind':'reversehome'
    // 		    , 'type':'twitter'
    // 		    , 'key': [url]}
    // 		  );
    
    
    element.removeAttribute("data-ultimate-url");
    element.removeAttribute("title");
    element.removeAttribute("data-expanded-url");
    docHeight = document.getElementById("stream-items-id").scrollHeight;
}

function expandURL() {
    $('a.twitter-timeline-link').map(
	function() {
	    var element = this;
	    if(!element.getAttribute('subv') && element.getAttribute("data-expanded-url")) {
		if(element.getAttribute("data-ultimate-url")) {
		    modify(element, element.getAttribute("data-ultimate-url"));
   		}
		else {
		    httpExpandURI(element);
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
  startId = window.setInterval(start, 1000);
}, false);
window.setInterval(newTweetsBar, 1000);
window.addEventListener("scroll", onScroll, false);

console.log(tc);