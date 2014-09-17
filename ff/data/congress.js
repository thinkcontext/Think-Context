if (window.top === window && !tc.found) {
tc.registerResponse('congress',tc.onLink);

tc.congress = {};

tc.congress.doit = function(){
    tc.congressPattern = "((Rep|Sen|Speaker|Leader|Congressm|Congressw)([\\S]*))[ ]+([A-ZáéíóúÉñÑ][a-zA-ZáéíóúÉñÑ\\'\\-]+ ([A-ZáéíóúÉñÑ]\\. )?[A-ZáéíóúÉñÑ][a-zA-ZáéíóúÉñÑ\\'\\-]+)";
    var cRe = new RegExp(tc.congressPattern,'g');

    // make a list of candidate matches
    var cs = tc.uniqueArray(document.body.textContent.match(cRe))
    if(cs && cs.length > 250)
	cs = cs.slice(0,250);

    var cong, cons, tn, cm, range, nn, tcid, mArray, name;
    tc.debug >= 2 && console.log('congress found',cs);
    for(var q in cs){
	cong = cs[q];
	// find all nodes that contain a candidate string
	cons = $.makeArray($("*:not('body,head,script,a,html'):contains("+cong+")"));
	for(var i = 0; i < cons.length; i++){
	    // the list contains ancestors we don't want
	    // so walk the list and skip those that are parents
	    if(!cons[i+1] || !cons[i+1].parentElement == cons[i]){
		// if this is the last element or this element is not the parent of the next element
		for(var j in cons[i].childNodes){
		    //iterate over the child nodes to find the right one
		    tn = cons[i].childNodes[j];
		    if(tn.nodeType == 3 && tn.parentElement.textContent.trim().length > (cong.length * 3)){
			// is this a text node and is it long enough 
			if(cm = tn.data.match(cong)){
			    // if it contains the text we are looking for 
			    // create the range and surround the text
			    nn = document.createElement('span');
			    tcid = tc.random();
			    var cRe = new RegExp(tc.congressPattern,'g');
			    mArray = cRe.exec(cong);
			    name = mArray[4];
			    if(mArray[5])
				name = name.replace(mArray[5],'');
			    name = tc.stCanon(name.toLowerCase().replace(' ',''));
			    nn.setAttribute('tcid',tcid);
			    //nn.style.backgroundColor = 'yellow'; //helps w/ debugging
			    range = document.createRange();
			    range.setStart(tn,cm.index);
			    range.setEnd(tn,cm.index + cong.length);
			    range.surroundContents(nn);
			    tc.sendMessage({
				kind: 'congress'
				, tcid: tcid
				, handle: 'name:' + name
			    });
			    //break;
			}
		    }
		}
	    }
	}
    }
}

tc.congress.doit();

}
