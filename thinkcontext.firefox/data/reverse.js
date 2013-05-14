if (window.frameElement === null){
    if(!( document.domain.match('google.com$') 
	  || document.domain.match('facebook.com$')
	  || document.domain.match('twitter.com$')
	  || document.domain.match('yahoo.com$')
	  || document.domain.match('bing.com$')
	)
       || document.domain == 'news.google.com'
       || document.domain == 'news.yahoo.com'
       || document.domain == 'news.bing.com'
      ){    
	
	tc.reverse = {};
	tc.reverse.revGotResponse = 0;
	
	tc.registerResponse('link',tc.resultPop);
	
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
				new EJS({text: tc.revEjs}).update("z"+z,{data:data,ex:ex});			
				tc.popDialog('Progressive Trackback', revDiv, 'z'+z,ex,'trackback16','reverse');
			    }
			});
    tc.registerResponse('reversehome', tc.reverseResponse);
    tc.sendMessage(
	{kind: 'reverse'
	 , key: tc.sigURL(document.baseURI)
	});
	
	$("link[rel='canonical']")
	    .map(function(){
		if(tc.sigURL(document.baseURI) != tc.sigURL(this.href)){
		    tc.sendMessage(
			{kind: 'reverse'
			 , key: tc.sigURL(this.href)
			});
		}});
	tc.sendMessage(
	    {kind: 'link'
	     , key: tc.sigURL(document.baseURI).replace(/https?:\/\//,'').replace(/\/$/,'')
	     , origLink: document.baseURI
	    });
	
	tc.reverseExamine();
	
    }

}