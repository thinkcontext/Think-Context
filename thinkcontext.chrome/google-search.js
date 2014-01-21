tc.googleSearch = {};

if(document.location.href.search('.*www.google.com/search\?.*') >= 0
   ||document.location.href.search('.*www.google.com/webhp') >= 0
   ||document.location.href.search('.*www.google.com/#') >= 0
   ||($('div#center_col').length == 0 && document.location.hostname == 'www.google.com' && document.location.pathname == '/')
  ){
    
    tc.googleSearch.doit = function(){
	
	//     ad links
	tc.searchLinkExam('ol.ads-container-list li.ads-ad:has(h3) div.ads-visurl cite'
			  ,'google-search'
			  , function(x){return x.parentElement.children[0]}
			  , function(x){ return x.textContent});
	
	//	result link	
	tc.searchLinkExam("ol#rso > li.g div > h3 > a",'google-search');

	// right column info box
	// tc.searchLinkExam("div#rhs_block div.kno-xs a.ab_button"
	// 		  ,'place'
	// 		  , null
	// 		  , function(x){
	// 		      console.log(x.href);
	// 		      if(m = x.href.match(/continue=https:\/\/plus.google.com\/([^\/]+)/)){
	// 			  console.log(m);
	// 			  return m[1]
	// 		      }
	// 		  }
	// 		 );
	    

    }
}else if(document.location.hostname == 'www.google.com' && document.location.pathname == '/maps/preview'){
    // this is the new google maps interface
    tc.googleSearch.doit = function(){
	tc.searchLinkExam("div.cards-entity-url a"
			  , 'google-search'
			  , function(x){
			      var ret;
			      var z = x.parentElement.parentElement.parentElement.parentElement;
			      if(z.classList.contains("cards-entity")){
				  $("h1.cards-entity-title",z).map(
				      function(){ 
					  ret = this; 
				      });
			      }
			      return ret;
			  }
			  , function(x){return x.textContent});		
    }
}
window.setInterval(tc.googleSearch.doit,750);