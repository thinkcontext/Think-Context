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
				    var data = request.data;
				    var x;
				    var found = 0;
				    var ex = false;
				    var z = tc.random();
				    var revDiv = $('<div>',{id:z} )
				    var tcstat = 'rrr';
				    if(data[0]['s'] == 'exact'){
					ex = true;
					revDiv.append($('<b>', {text:"This link was mentioned in"})).append($('<br>'));
				    } 
				    for(x in data){
					if(data[x]['s'] != 'exact' && found == 0){
					    revDiv.append($('<b>', {text:"Other links to this site"})).append($('<br>'));
					    found = 1;	
					}
					
					if(tc.iconStatus[data[x].source] == 1){

					    revDiv.append($('<li>')
							  .append($('<img>',{ style: "display:inline;"
									      , height:"16"
									      , width:"16"
			       						      ,src: tc.iconDir + "/" + data[x].source + ".ico"})
								 )
							  .append($('<a>', { tcstat: tcstat + data[x].id 
									     , target: "_blank"
									     , href: data[x].link
									     , text: tc.htmlDecode(data[x].title)}))
							  .append(' by ')
							  .append($('<a>', {href: data[x].source_link, text: data[x].name}))
							  .append(' links to ')
							  .append($('<a>', { href: data[x].reverse_link
									     , text: 'this page'})));
					    
					} else {
					    revDiv.append($('<li>')
							  .append($('<a>', { tcstat: tcstat + data[x].id 
									     , target: "_blank"
									     , href: data[x].link
									     , text: tc.htmlDecode(data[x].title)}))
							  .append(' by ')
							  .append($('<a>', {href: data[x].source_link, text: data[x].name}))
							  .append(' links to ')
							  .append($('<a>', { href: data[x].reverse_link
									     , text: 'this page'})));
					    
					}
				    }
				    tc.popDialog('Progressive Trackback', revDiv, z,ex);
				}
			    });

	tc.registerResponse('reversehome', tc.reverseResponse);
	self.postMessage({'kind': 'reverse'
			  , 'key': tc.sigURL(document.baseURI)
			 });

	$("link[rel='canonical']")
	    .map(function(){
		if(tc.sigURL(document.baseURI) != tc.sigURL(this.href)){
		    console.log(this);
		    tc.sendMessage(
			{'kind': 'reverse'
			 , 'key': tc.sigURL(this.href)
			});
		}});
	
	tc.reverseExamine();
    }
}