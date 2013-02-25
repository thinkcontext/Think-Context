if (window.frameElement === null){
    if(! (/^http(s)?:\/\/www.google.com\//.test(document.URL)
	  || /^http(s)?:\/\/maps.google.com\/maps\/place/.test(document.URL)
	  || /^http(s)?:\/\/bing.google.com\/search/.test(document.URL)
	  || /^http(s)?:\/\/search.yahoo.com\/search/.test(document.URL)
	 )
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
				    new EJS({url: chrome.extension.getURL(iconDir + '../rev.ejs')}).update("z"+z,{data:data,ex:ex});

				    
				    tc.popDialog('Progressive Trackback', revDiv, 'z'+z,ex);
				}
			    });

	tc.registerResponse('reversehome', tc.reverseResponse);
	self.postMessage({'kind': 'reverse'
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
    }
}