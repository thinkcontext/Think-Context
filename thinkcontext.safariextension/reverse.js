if (window.top === window) {
    if(! (/^http(s)?:\/\/www.google.com\//.test(document.URL)
	  || /^http(s)?:\/\/maps.google.com\/maps\/place/.test(document.URL)
	  || /^http(s)?:\/\/bing.google.com\/search/.test(document.URL)
	  || /^http(s)?:\/\/search.yahoo.com\/search/.test(document.URL)
	  || document.domain.match('google.com$')
	  || document.domain.match('facebook.com$')
	  || document.domain.match('twitter.com$')
	 ) || document.domain == 'news.google.com'
      ){    
	tc.reverse = {};
	tc.reverse.revGotResponse = 0;

tc.registerResponse('reverse', 
		    function(request){
			if(tc.reverse.revGotResponse == 0){
			    tc.reverse.revGotResponse = 1;
			    var data = request.data;
			    var ex = false;
			    if(data[0]['s'] == 'exact'){
				ex = true;
			    }
			    var z = tc.random();
			    var revDiv = $('<div>',{id:"z"+z}).appendTo('body');
			    new EJS({url: chrome.extension.getURL('rev.ejs')}).update("z"+z,{data:data,ex:ex});

			    
			    tc.popDialog('Progressive Trackback', revDiv, 'z'+z,ex);
			}
		    });
	tc.registerResponse('reversehome', tc.reverseResponse);
	tc.sendMessage(
	    {'kind': 'reverse'
	     , 'key': tc.sigURL(document.baseURI)
	    });

	$("link[rel='canonical']")
	    .map(function(){
		if(tc.sigURL(document.baseURI) != tc.sigURL(this.href)){
		    tc.sendMessage(
			{'kind': 'reverse'
			 , 'key': tc.sigURL(this.href)
			});
		}});


	tc.reverseExamine();
	safari.self.addEventListener("message",tc.onResponse, false);
	
    }
}