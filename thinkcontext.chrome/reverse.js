tc.registerResponse('reverse', 
		    function(request){
			var data = request.data;
			var x;
			var found = 0;
			var ex = false;
			var z = Math.floor(Math.random() * 100000);
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
					      .append(' links to ')
					      .append($('<a>', { href: data[x].reverse_link
								 , text: 'this page'})));
				
			    } else {
				revDiv.append($('<li>')
					      .append($('<a>', { tcstat: tcstat + data[x].id 
								 , target: "_blank"
								 , href: data[x].link
								 , text: tc.htmlDecode(data[x].title)}))
					      .append(' links to ')
					      .append($('<a>', { href: data[x].reverse_link
								 , text: 'this page'})));
				
			    }
			}
			tc.popDialog('Progressive Trackback', revDiv, z,ex);
		    });
tc.registerResponse('reversehome', tc.reverseResponse);
tc.sendMessage(
    {'kind': 'reverse'
     , 'key': tc.sigURL(document.baseURI)
    });

tc.reverseExamine();
