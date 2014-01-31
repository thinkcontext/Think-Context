//x                 "http://*.washingtonpost.com/*"
//x 		   ,"http://*.nytimes.com/*"
//y 		   ,"http://online.wsj.com/*"
//y 		   ,"http://new.yahoo.com/*"
//x 		   ,"http://*.cnn.com/*"
//x 		   ,"http://*.boston.com/*"
//x 		   ,"http://*.npr.org/*"
//x 		   ,"http://*.foxnews.com/*"
//x 		   ,"http://*.huffingtonpost.com/*"
//x 		   ,"http://*.usatoday.com/*"
//xy 		   ,"http://*.abcnews.go.com/*"
//x 		   ,"http://*.latimes.com/*"
//xy 		   ,"http://*.nbcnews.com/*"

// false positives
// "Republican Senator Charles" Grassley npr
// "Senate Judiciary Committee" npr

// didn't find
// <strong>Eric Cantor</strong> (R., Va.) wsj
// Rep. <strong>Steve Israel</strong> (D., N.Y.) wsj
// Rep. Henry Waxman usatoday
// Mark Pryor of Arkansas yahoo/reuters
// <strong>Rep. Paul Ryan</strong>, R-Wis abc
// <strong>Rep. Joe Wilson </strong> nbc

function uniqueArray(a) {
    return a.reduce(function(p, c) {
        if (p.indexOf(c) < 0) p.push(c);
        return p;
    }, []);
};

var congressRegexp = /((Rep|Sen)([^\s]*)) ([A-Z][a-zA-Z\'\-]+ ([A-Z]\. )?[A-Z][a-zA-Z\'\-]+)/g;


cs = uniqueArray(document.body.textContent.match(congressRegexp));

var cong, cons, tn, cm, range, nn;

for(var q in cs){
    cong = cs[q];
    
    // find all nodes that contain a congress string
    cons = $.makeArray($("*:not('body,head,script,a,html'):contains("+cong+")"));
    
    for(var i in cons){
	// the list contains ancestors we don't want
	// so walk the list and skip those that are parents

	if(!cons[i+1] || !cons[i+1].parentElement == cons[i]){
	    // if this is the last element or this element is not the parent of the next element
	    for(var j in cons[i].childNodes){
		//iterate over the child nodes to find the right one
		tn = cons[i].childNodes[j];
		//console.log(tn.data.trim().length, (cong.length * 3))
		if(tn.nodeType == 3 && tn.data.trim().length > (cong.length * 3)){
		    // is this a text node and is it long enough 
		    if(cm = tn.data.match(cong)){
			// if it contains the text we are looking for 
			// create the range and surround the text
			nn = document.createElement('span');
			nn.style.backgroundColor = 'yellow';
			range = document.createRange();
			range.setStart(tn,cm.index);
			range.setEnd(tn,cm.index + cong.length);
			range.surroundContents(nn);
		    }
		}
	    }
	}
    }
}
