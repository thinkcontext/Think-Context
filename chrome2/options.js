(function(){

    var bgPage = chrome.extension.getBackgroundPage();
    var campaigns = bgPage.tc.campaigns, campaign;
    var actions = bgPage.tc.actions;
    var availableCampaigns, availableActions, unavailableCampaigns;
    bgPage.tc.getAvailableCampaigns(
	function(x){ 
	    availableCampaigns = [];
	    for(var z in x){
		availableCampaigns.push(x[z]);
	    }
	    availableCampaigns = availableCampaigns.sort(function(a,b){ if(a.title > b.title){ return 1 }else{ return -1}});

	    // 
	    var alist = availableCampaigns.map(function(x){ return x.tid});	
	    unavailableCampaigns = campaigns.filter(function(x){ return alist.indexOf(x) == -1 })
	    bgPage.tc.getAvailableActions(
		function(y){ 
		    availableActions = y
		    renderPage();
		}
	    );
	});

    function renderPage(){
	var aTD, action, checked;

	for(var i in availableCampaigns){
	    campaign = availableCampaigns[i];
	    aTD = $("<td>");
	    for(var a in campaign['actions']){
    		action = availableActions[campaign.actions[a]];
    		aTD.append($("<img>",{src: action['icon']}));
	    }    
	    if(campaigns.length >= 1 && campaigns.indexOf(campaign['tid']) >= 0){
		checked = true;
	    } else {
		checked = false;
	    }
	    
	    $("<tr>")
    		.append($("<td>")
    			.append($("<input>",{class: 'campaignSubscribe', type: 'checkbox', id: campaign['tid'],checked:checked})))
    		.append(aTD)
    		.append($("<td>")
			.append($("<span>",{class: 'camp-title', text: campaign['title']})))
    		.appendTo("#campaigns");    	
	    $("<tr>")
		.append($("<td>"))
		.append($("<td>"))
		.append($("<td>",{class: 'camp-desc'})
			.append(campaign['description'])
			.append($("<a>",{href: campaign['link'], text: " More info"})))
    		.appendTo("#campaigns");    	
	}
	var val = localStorage['opt_popD'];
	if(val != null){
	    $("[name='popD'] option[value='" + val + "']").map(
		function(){
		    this.selected = true;
		});
	}
    }

    function saveOptions(){
	var camps = unavailableCampaigns;
	$("input.campaignSubscribe").map(
	    function(){ this.checked && camps.push(this.id) }
	);
	camps = bgPage.tc.uniqueArray(camps);
	bgPage.tc.saveCampaigns(camps);
	localStorage['opt_popD'] = $("[name='popD']").val();
	campaigns = camps;
	$('div#saveMsg').append('Saved');
	setTimeout(
	    function(){ 
		$('div#saveMsg').map(function(){this.innerHTML = ''});
		window.close();
	    }
	    , 1000);
    }

    $("button#save").click(function(e){saveOptions();});
    $(window).on('beforeunload', function(){
	var camps = unavailableCampaigns;
	$("input.campaignSubscribe").map(
	    function(){ this.checked && camps.push(this.id) }
	);
	camps = bgPage.tc.uniqueArray(camps);
	if(campaigns.sort().join(',') != camps.sort().join(',')){
	    return "You've made changes but haven't saved them.  Stay on the page and then click the \"Save\" button if you want to keep your changes."
	}
    });

})()
