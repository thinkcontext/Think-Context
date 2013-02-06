// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray( strData, strDelimiter ){
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = (strDelimiter || ",");

    // Create a regular expression to parse the CSV values.
    var objPattern = new RegExp(
        (
            // Delimiters.
            "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

            // Quoted fields.
            "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

            // Standard fields.
            "([^\"\\" + strDelimiter + "\\r\\n]*))"
        ),
        "gi"
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    var arrData = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    var arrMatches = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while (arrMatches = objPattern.exec( strData )){
        // Get the delimiter that was found.
        var strMatchedDelimiter = arrMatches[ 1 ];

        // Check to see if the given delimiter has a length
        // (is not the start of string) and if it matches
        // field delimiter. If id does not, then we know
        // that this delimiter is a row delimiter.
        if (
            strMatchedDelimiter.length &&
                (strMatchedDelimiter != strDelimiter)
        ){
            // Since we have reached a new row of data,
            // add an empty row to our data array.
            arrData.push( [] );
        }

        // Now that we have our delimiter out of the way,
        // let's check to see which kind of value we
        // captured (quoted or unquoted).
        if (arrMatches[ 2 ]){
            // We found a quoted value. When we capture
            // this value, unescape any double quotes.
            var strMatchedValue = arrMatches[ 2 ].replace(
                new RegExp( "\"\"", "g" ),
                "\""
            );

        } else {
            // We found a non-quoted value.
            var strMatchedValue = arrMatches[ 3 ];
        }

        // Now that we have our value string, let's add
        // it to the data array.
        arrData[ arrData.length - 1 ].push( strMatchedValue );
    }
    // Return the parsed data.
    return( arrData );
}
String.prototype.repeat = function(count) {
    if (count < 1) return '';
    var result = '', pattern = this.valueOf();
    while (count > 0) {
        if (count & 1) result += pattern;
        count >>= 1, pattern += pattern;
    };
    return result;
};

function getReverseHost(url){
    var host;
    var ar;
    var tld;
    if(host = url.split('/')[2]){
	ar = host.split('.');
	if(ar[0] == 'www'){
	    ar.shift();
	}
	tld = ar[ar.length - 1];
	if(ar.length <= 2){
	    return ar.join('.')
	} else if((tld == 'com'
		   || tld == 'net'
		   || tld == 'gov'
		   || tld == 'edu'
		   || tld == 'org')
		  && !(tld == 'com' 
		       && (ar[ar.length - 2] == 'patch'
			    || ar[ar.length - 2] == 'cbslocal'
			    || ar[ar.length - 2] == 'yahoo'
			    || ar[ar.length - 2] == 'curbed'
			    || ar[ar.length - 2] == 'craigslist')
		       )){
	    return ar.slice(ar.length - 2).join('.')
	} else {
	    return ar.slice(ar.length - 3).join('.')
	}
    }
    return null;
}

function bitlyDomain(domain){
    if(domain == 'bitly.com' || domain == 'bit.ly' || domain == 'nyti.ms' || domain == 'wapo.st' || domain == 'n.pr' || domain == 'on.wsj.com' || domain == 'bbc.in'|| domain == 'gaw.kr'|| domain == 'huff.to'|| domain == 'bloom.bg'|| domain == 'nyp.st'|| domain == 'politi.co'|| domain == 'usat.ly'|| domain == 'j.mp'|| domain == 'cbsn.ws'|| domain == 'fxn.ws'|| domain == 'theatln.tc'|| domain == 'on.msnbc.com'|| domain == 'slate.me'|| domain == 'buswk.co'|| domain == 'thebea.st'|| domain == 'ti.me'|| domain == 'bo.st'|| domain == 'econ.st'|| domain == 'cnet.co'|| domain == 'chroni.cl'|| domain == 'on.cc.com'|| domain == 'yhoo.it'|| domain == 'trib.in'|| domain == 'wny.cc'|| domain == 'rol.st'|| domain == 'hrld.us')
	return 1
}

function resolveMap(url){
    var s = url.split('/');
    if(s.length > 3){
	var domain = s[2];
	if(bitlyDomain(domain))
	    return 'https://bitly.com/' + s[3];
	else if(domain == 'goo.gl')
	    return url;	
    }
}