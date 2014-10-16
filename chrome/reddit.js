if (window.top === window && !tc.found && document.domain.match(/(^|\.)reddit\.com$/)) {
    tc.debug && console.log("reddit");
    tc.found = true;
    
    tc.handleExamine("a.title");
}
