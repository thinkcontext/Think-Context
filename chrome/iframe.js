if(window != window.parent){
    console.log('iframe',document.URL,document.body);
    if(document.domain.match('adsonar.com')
       || document.domain.match('msn.com')
       || document.URL.match("doubleclick.net/pagead/")
       || document.domain.match('overture.com')
       || document.URL.match("ad.doubleclick.net/adi/")       
      ){ 
    if(document.domain.match('adsonar.com')){
	tc.handleExamine("p.lnk a"
			 ,'urlfrag'
			 ,function(x){ return x.textContent;}
			);

	// $("td[onmouseover|='wMes']").not('a[sid]').map(
	// 	function(){
	// 	    console.log('onmouseover',this.onmouseover);
	// 	});
    } else if(document.domain.match('msn.com')){
	tc.handleExamine('a.AdDisplayUrl'
			 ,'urlfrag'
			 ,function(x){ return x.textContent;}
			);
	// } else if(document.baseURI.match('ad.doubleclick.net/adi')){
	//     console.log('doubleclick adi iframe');
	//     $("object param[value*='adurl%3D']").map(
	// 	function(){
	// 	    console.log(this);
	// 	    var m = this.value.match(/sscs%253D%253fhttp(s)?%3A\/\/([^\/]+)/);
	// 	    if(m && m.length == 3){
	// 		console.log('doubleclick param ' + m[2])
	// 	    } else {
	// 		m = this.value.match(/adurl%253(http[^\&]+)/)
	// 		if(m && m.length == 2){
	// 		console.log('doubleclick param ' + m[1])
	// 		}
	// 	    }
	// 	});
	//     $("a:has(img)").map(
	// 	function(){
	// 	    console.log(this);
	// 	});
    } else if(document.baseURI.match('doubleclick.net/pagead')){
	window.setTimeout(
	    function(){
		tc.handleExamine("a.rhurl[href*='googleadservices.com/pagead']"
				 ,'urlfrag'
				 ,function(x){ return x.textContent;}
				);

		// samples/nytimes-dc-img.html
		$("a[href*='googleadservices.com/pagead/aclk'] > img").map(
		    function(){
			var m,href = this.parentElement.href;
			if(m = href.match(/adurl=([^&]*)/) && m[1]){
			    console.log('ad img',m[1]);
			}
		    });

		// samples/nytimes-dc-obj.html
		$("a[href*='googleadservices.com/pagead/aclk'] object[flashvars*='adurl']").map(
		    function(){
			var m,obj = this.childNodes[0].childNodes[0], href=decodeURIComponent(obj.attributes['flashvars']);
			if(m = href.match(/adurl=([^&]*)/) && m[1]){
			    console.log('ad img',m[1]);
			}
		    });
	    }
	    , 500);
    } else if(document.domain.match('overture.com')){
	tc.handleExamine("div.clsURL"
			 ,'urlfrag'
			 ,function(x){ return x.textContent;}
			);
	// } else if(document.domain.match(".advertising.com")){
	//     console.log('advertising.com');
	//     $("object param[value*='trg\%253Dhttp']").not('a[sid]').map(
	// 	function(){
	// 	    console.log("advertising.com",this);
	// 	});
	//     $("a[href*='doubleclick.net']:has(img)").not('a[sid]').map(
	// 	function(){
	// 	    console.log("advertising.com",this);
	// 	    if(m = this.href.match(/trg=(http.+)$/) && m[1]){
	// 		console.log(m[1]);
	// 	    }	
	// 	});
	// } else if(document.domain.match(".interclick.com")){
	//     $("a[href*='doubleclick.net']:has(img)").not('a[sid]').map(
	// 	function(){
	// 	    console.log("interclick.com",this);
	// 	    if(m = this.href.match(/click\.ic\%3F(http.+)$/) && m[1]){
	// 		console.log(m[1]);
	// 	    }	
	// 	});
	//     $("object param[value*='doubleclick.net']").not('a[sid]').map(
	// 	function(){
	// 	    console.log("interclick.com",this);
	// 	    if(m = this.value.match(/click\.ic\%3F(http.+)$/) && m[1]){
	// 		console.log(m[1]);
	// 	    }	
	// 	});
    }
    }
}
