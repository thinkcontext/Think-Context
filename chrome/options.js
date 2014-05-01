var bgPage = chrome.extension.getBackgroundPage();
var campaigns = bgPage.tc.campaigns, campaign;
var actions = bgPage.tc.actions;
var availableCampaigns = bgPage.tc.availableCampaigns;
var availableActions = bgPage.tc.availableActions;
var aTD, action;

console.log(availableCampaigns);

for(var i in availableCampaigns){
    campaign = availableCampaigns[i];
    aTD = $("<td>");
    for(var a in campaign['actions']){
    	action = availableActions[campaign.actions[a]];
    	aTD.append($("<img>",{src: action['icon']}));
    }    
    
    $("<tr>")
    	.append($("<td>")
    		.append($("<input>",{class: 'campaignSubscribe', type: 'checkbox', id: campaign['tid']})))
    	.append(aTD)
    	.append($("<td>",{text: campaign['title']}))
    	.appendTo("#campaigns");    
}

$("input.campaignSubscribe").on(
    'change',
    function(e){
	console.log(this);
	console.log(e);
    });

