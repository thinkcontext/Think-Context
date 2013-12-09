// result link
tc.searchLinkExam('ol#b_results li.b_algo h2 a','bing-search');


// ads
tc.searchLinkExam('ol#b_context li.b_ad div.sb_add:has(h2 > a) div.b_caption > div.b_attribution > cite'
		  ,'bing-search'
		  , function(x){ return x.parentElement.parentElement.parentElement.children[0].children[0];}
		 , function(x){return x.textContent;});

