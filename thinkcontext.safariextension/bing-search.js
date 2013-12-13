if (window.top === window) {
    if(document.baseURI.search("http://www.bing.com/search.*") >= 0){
	// result link
	tc.searchLinkExam('ol#b_results li.b_algo h2 a','bing-search');


	// ads
	tc.searchLinkExam('li.b_ad div.sb_add:has(h2 > a) div.b_caption > div.b_attribution > cite'
			  ,'bing-search'
			  , function(x){ return x.parentElement.parentElement.parentElement.children[0].children[0];}
			  , function(x){return x.textContent;});

	safari.self.addEventListener("message",tc.onResponse, false);
    }
}
