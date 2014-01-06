// Saves options to localStorage.

var checkOpts = [ 'opt_rush','opt_green','opt_hotel','opt_bechdel', 'opt_bcorp', 'opt_roc' ]
var bgPage = chrome.extension.getBackgroundPage();

function save_options() {
    var val;
    for(var i in checkOpts){
	if(document.getElementById(checkOpts[i]).checked == true){
	    val = 1;	    
	}else{ 
	    val = 0;
	}
	bgPage.tc.removeLocalTableVersion('results');
	if(i == 'opt_hotel' || i == 'opt_roc'){
	    bgPage.tc.removeLocalTableVersion('place');
	    bgPage.tc.removeLocalTableVersion('place_data');	    
	}
	localStorage[checkOpts[i]] = val;
    }
    
    localStorage['opt_popD'] = $("[name='popD']").val();
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
	status.innerHTML = "";
    }, 750);
    bgPage.tc.loadAllTables();
}


// Restores select box state to saved value from localStorage.
function restore_options() {
    var val;
    for(var i in checkOpts){
	val = localStorage[checkOpts[i]];
	if(val == 1 || val == null)
	    val = true;
	else 
	    val = false;
	document.getElementById(checkOpts[i]).checked = val;
    }
    val = localStorage['opt_popD'];
    if(val != null){
	$("[name='popD'] option[value='" + val + "']").map(
	    function(){
		this.selected = true;
	    });
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);

if(document.documentURI.match(/\?update$/)){
    $('div#update').css('display','inline');
} else if(document.documentURI.match(/\?install$/)){
    $('div#install').css('display','inline');
}
