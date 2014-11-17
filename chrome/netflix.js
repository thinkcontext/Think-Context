if (window.top === window && !tc.found && document.domain.match(/(^|\.)netflix\.com$/)) {
    tc.found = true;
    
    var h = new tc.urlHandle(document.URL);

    if(h.kind == 'netflix'){
	tc.handleExamine("a[href*='m/']:not([href*='"+h.hval+"'])",'netflix');
    } else {
	tc.handleExamine("a[href*='m/']",'netflix');
    }

    var bindElement;

    switch ($('body').attr('id')) {
    case 'page-WiHome':
        bindElement = '.boxShot';
        break;
	
    case 'page-WiAltGenre':
        bindElement = '.boxShot';
        break;
	
    case 'page-WiMovie':
        bindElement = '.agMovie';
        break;
	
    case 'page-RecommendationsHome':
        bindElement = '.agMovie';
        break;
	
    default:
        bindElement = '.boxShot';
        break;
    }

    $(bindElement).each(function() {
        var $this = $(this)
        ,   $movieLink = $this.find('a')
        ,   $parentEl = $this.parent()
        ,   $parentElClass = $parentEl.attr('class')
        ,   bindElementTemp = $movieLink.closest(bindElement)
        ,   hit_the_server = true
        ,   RTData = {};

	
    }

}
