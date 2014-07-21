if (window.top === window && !tc.found && document.domain.match(/(^|\.)orbitz\.com$/)) {
    tc.found = true;
    tc.simpleHandleExamine("a[href*='orbitz.com/hotel/']");
}
