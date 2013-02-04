// Saves options to localStorage.

var opts = [ 'opt_news','opt_rush','opt_green','opt_hotel' ]

function save_options() {
    var val;
    for(var i in opts){
	if(document.getElementById(opts[i]).checked == true)
	    val = 1;
	else 
	    val = 0;
	localStorage[opts[i]] = val;
    }
    chrome.extension.getBackgroundPage().tc.loadAllTables();
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
	status.innerHTML = "";
    }, 750);
}

// Restores select box state to saved value from localStorage.
function restore_options() {
    var val;
    for(var i in opts){
	console.log(opts[i]);
	val = localStorage[opts[i]];
	console.log(val);
	if(val == 1 || val == null)
	    val = true;
	else 
	    val = false;
	console.log(val);
	document.getElementById(opts[i]).checked = val;
    }
}

document.addEventListener('DOMContentLoaded', restore_options);
document.querySelector('#save').addEventListener('click', save_options);