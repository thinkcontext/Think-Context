var bgPage = chrome.extension.getBackgroundPage();
var campaigns = bgPage.tc.campaigns, campaign;
var actions = bgPage.tc.actions;
var availableCampaigns, availableActions;
bgPage.tc.getAvailableCampaigns(
    function(x){ 
	availableCampaigns = [];
	for(var z in x){
	    availableCampaigns.push(x[z]);
	}
	availableCampaigns = availableCampaigns.sort(function(a,b){ if(a.title > b.title){ return 1 }else{ return -1}});
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
    	    .append($("<td>",{text: campaign['title']}))
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
    var camps = [];
    $("input.campaignSubscribe").map(
	function(){ this.checked && camps.push(this.id) }
    );
    bgPage.tc.saveCampaigns(camps);
    localStorage['opt_popD'] = $("[name='popD']").val();
}


$("button#save").click(function(e){saveOptions();});


