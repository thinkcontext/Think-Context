if (window.top === window && !tc.found && document.domain.match(/(^|\.)hotels\.com$/)) {
    tc.found = true;
    tc.simpleHandleExamine("a[href*='hotels.com/ho']");
}
