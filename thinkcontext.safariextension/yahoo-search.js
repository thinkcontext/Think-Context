//if window.top === window 
console.log('yahoo',document.baseURI);

    if(document.baseURI.search("https?://.*search.yahoo.com/.*") >= 0 ){

tc.searchLinkExam('div#web > ol h3 > a'
		  , 'yahoo-search');

// ads

tc.searchLinkExam('div.ads ul.spns li.sitelink:has(div > a) em > a'
		  , 'yahoo-search'
		  , null //function(x){return x.parentElement.children[0].children[0];}
		  , function(x){return x.textContent});
    safari.self.addEventListener("message",tc.onResponse, false);    
}
//}
