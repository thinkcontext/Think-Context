// result link
tc.handleExamine('ol#b_results li.b_algo h2 a',null);

// ads
tc.handleExamine('li.b_ad div.sb_add:has(h2 > a) div.b_caption > div.b_attribution > cite'
		  ,null
		  , function(x){ return x.parentElement.parentElement.parentElement.children[0].children[0];}
		  , function(x){return x.textContent;});

