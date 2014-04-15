var bgPage = chrome.extension.getBackgroundPage();
var campaigns = bgPage.tc.campaigns;
var actions = bgPage.tc.actions;
var campaign;

for(var i in campaigns){
    campaign = campaigns[i];
    $("<tr>")
	.append($("<td>",{text: campaign['tid']}))
	.append($("<td>",{text: campaign['title']}))
	.appendTo("#campaigns");
    
}