tc.searchLinkExam('div#web > ol h3 > a'
		  , 'yahoo-search');

// ads

tc.searchLinkExam('div.ads ul.spns li.sitelink:has(div > a) > em > a'
		  , 'yahoo-search'
		  , function(x){return x.parentElement.children[0].children[0];}
		  , function(x){return x.textContent});
