tc.popSend();

tc.handleExamine("div.ego_unit > div:first-child > div:first-child > a:nth-child(2) div[title] > div:nth-child(2)"
		 ,null
		 ,function(x){ return x.textContent }
		);

tc.handleExamine("div:has(a.uiStreamSponsoredLink) > h5 a");
