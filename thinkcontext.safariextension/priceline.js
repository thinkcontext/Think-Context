if (window.top === window && !tc.found && document.domain.match(/(^|\.)priceline\.com$/)) {
    tc.found = true;
    tc.simpleHandleExamine("[itemprop='name'] > a[href*='hotel-reviews']");
}
