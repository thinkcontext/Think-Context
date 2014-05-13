//DDG Next

// header
tc.handleExamine("h1.zci__header a",null);

// result link
tc.handleExamine("div.results a.result__a",null);

//ads 
tc.handleExamine("div.ads a.result__url"
		 ,null
		 ,function(x){return x.textContent;}
		 ,function(x){ return x.parentElement.parentElement.parentElement;}
		);
