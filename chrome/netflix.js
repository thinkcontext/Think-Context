if (window.top === window && !tc.found && document.domain.match(/(^|\.)netflix\.com$/)) {
    tc.found = true;
// ------------------ isONScreen ---------------------
// Jquery Plugin -- calculates whether an element is currently displayed in the viewport
    $.fn.isOnScreen = function() {
	var win = $(window);
	var viewport = {
            top: win.scrollTop(),
            left: win.scrollLeft()
	};
	
	viewport.right = viewport.left + win.width();
	viewport.bottom = viewport.top + win.height();
	
	var bounds = this.offset();
	bounds.right = bounds.left + this.outerWidth();
	bounds.bottom = bounds.top + this.outerHeight();
	
	return (!(viewport.right < bounds.left || viewport.left > bounds.right || viewport.bottom < bounds.top || viewport.top > bounds.bottom));
    };  
    
    (function(){
	
	function onNFLink(request){
	    // add styling 
	    tc.onLink(request,'tcNetflix');
	}

	function rateMovie(n){
	    var h = new tc.urlHandle(n.href);
	    if(h && h.handle){
		var r = tc.random();	    
		n.setAttribute('tcid',r);
		tc.sendMessage({
		    kind: 'nfLink'
		    , tcid: r
		    , handle: h.handle});
	    }	    
	}

	function rateSliderMovies(slider){
	    nlinks = $(slider).find(selector).not('[tcid]').each(
		function(){
		    rateMovie(this);
		});	    
	}

	function rateVisibleMovies(){
	    nlinks = $(selector).not('[tcid]').each(
		function(){
		    var $this = $(this);
		    if($this.isOnScreen()){
			rateMovie(this);
		    }
		});	    
	}
	var h = new tc.urlHandle(document.URL);
	var selector;
	
	if(h.kind == 'netflix'){
	    selector = "a.playLink:not([href*='"+h.hval+"'])";
	} else {
	    selector = "a.playLink";
	}
	
	tc.registerResponse('nfLink',onNFLink);
	rateVisibleMovies();

	$(".sliderButton").mouseover(function() {
            rateSliderMovies(this.parentElement);
	});
	$(window).scroll(function(){
	    rateVisibleMovies();
	});
	
    }());
}
