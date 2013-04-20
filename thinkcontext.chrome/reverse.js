if(! document.domain.match('google.com$') || document.domain == 'news.google.com'){
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
				new EJS({url: chrome.extension.getURL('rev.ejs')}).update("z"+z,{data:data,ex:ex});

				
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
		    {'kind': 'reverse'
		     , 'key': tc.sigURL(this.href)
		    });
	    }});
    tc.sendMessage(
	{kind: 'link'
	 , key: tc.sigURL(document.baseURI)
	});

    tc.reverseExamine();

}