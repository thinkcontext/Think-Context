var campaigns, campaign, actions, availableCampaigns, availableActions, unavailableCampaigns, opt_popD;


if(document.documentURI.match(/\?update$/)){
    $('div#update').css('display','inline');
} else if(document.documentURI.match(/\?install$/)){
    $('div#install').css('display','inline');
}
self.on('message', onResponse);
self.postMessage({ kind: 'sendOptions' });

function uniqueArray(a) {
    if(a)
	return a.reduce(function(p, c) {
	    if (p.indexOf(c) < 0) p.push(c);
	    return p;
	}, []);
}

function onResponse(message){
    opt_popD = message.options.opt_popD;
    campaigns = message.campaigns; 
    actions = message.actions; 
    availableCampaigns = message.availableCampaigns; 
    availableActions = message.availableActions;
    availableCampaigns = availableCampaigns.sort(function(a,b){ if(a.title > b.title){ return 1 }else{ return -1}});
    var alist = availableCampaigns.map(function(x){ return x.tid});	
    unavailableCampaigns = campaigns.filter(function(x){ return alist.indexOf(x) == -1 })
    renderPage();
}

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
    if(opt_popD != null){
	$("[name='popD'] option[value='" + opt_popD + "']").map(
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
    camps = uniqueArray(camps);
    self.postMessage({kind: 'saveOptions', campaigns: camps, options: {'opt_popD': $("[name='popD']").val()}});
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
    camps = uniqueArray(camps);
    if(campaigns.sort().join(',') != camps.sort().join(',')){
	return "You've made changes but haven't saved them.  Stay on the page and then click the \"Save\" button if you want to keep your changes."
    }
});

