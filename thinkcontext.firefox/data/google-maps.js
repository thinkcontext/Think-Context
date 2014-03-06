if (window.frameElement === null){
tc.googleMaps = {};
tc.googleMaps.doit = function(){


    // sidebar
    tc.searchLinkExam("div.one span.pp-headline-authority-page"
		      , 'google-search'
			  , function(x){
			      var ret;
			      var z = x.parentElement.parentElement.parentElement.parentElement;
			      if(z.classList.contains("one")){
				  $("div.lname",z).map(
				      function(){ 
					  ret = this; 
				      });
			      }
			      return ret;
			  }
		      , function(x){return x.textContent});	

    // in map popup dialogs

    tc.searchLinkExam("div.gmnoprint td.basicinfo div#iwhomepage a"
		      , 'google-search'
		      , null
		      , function(x){return x.textContent});	
    
};
window.setInterval(tc.googleMaps.doit,750);
}
