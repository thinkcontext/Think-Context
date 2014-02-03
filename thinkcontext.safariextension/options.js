// Saves options to localStorage.

var checkOpts = [ 'opt_rush','opt_green','opt_hotel', 'opt_bechdel', 'opt_bcorp', 'opt_roc','opt_hrc' ];

function save_options() {
    var val;
    var reResults = 0, rePlace = 0, argOpts = {};
    for(var i in checkOpts){
	if(document.getElementById(checkOpts[i]).checked == true){
	    val = 1;	    
	}else{ 
	    val = 0;
	}	
	argOpts[checkOpts[i]] = val
	reResults = 1;
	if(checkOpts[i] == 'opt_hotel' || checkOpts[i] == 'opt_roc'){
	    rePlace = 1;
	}
    }
    
    argOpts['opt_popD'] = $("[name='popD']").val();
    safari.self.tab.dispatchMessage('optionsChange',{kind: 'optionsChange', opts: argOpts, reResults: reResults, rePlace: rePlace});
    // Update status to let user know options were saved.
    var status = document.getElementById("status");
    status.innerHTML = "Options Saved.";
    setTimeout(function() {
	status.innerHTML = "";
    }, 750);
}


// Restores select box state to saved value from localStorage.
function restore_options(message) {
    var val;
    for(var i in checkOpts){
	val = message.opts[checkOpts[i]];
	if(val == 0)
	    val = false;
	else 
	    val = true;
	document.getElementById(checkOpts[i]).checked = val;
    }
    val = message.opts['opt_popD'];
    if(val != null){
	$("[name='popD'] option[value='" + val + "']").map(
	    function(){
		this.selected = true;
	    });
    }
}
safari.self.addEventListener(
    "message"
    , function(e){
	var message = e.message;
	if(message.kind == 'restoreOptions'){ 
	    restore_options(message); 
	}
    });
    
document.addEventListener('DOMContentLoaded'
			  , function(){
			      safari.self.tab.dispatchMessage(
				  'restoreOptions'
				  , {kind: 'restoreOptions'});
			  });
			      
document.querySelector('#save').addEventListener('click', save_options);

if(document.documentURI.match(/\?update$/)){
    $('div#update').css('display','inline');
} else if(document.documentURI.match(/\?install$/)){
    $('div#install').css('display','inline');
}
