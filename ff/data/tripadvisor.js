if (window.top === window && !tc.found && document.domain.match(/(^|\.)tripadvisor\.com$/)) {
    tc.found = true;
    tc.handleExamine("a.property_title[href*='_Review-g'], div.reviewHotel > a[href*='_Review-g'], div.propertyLink > a[href*='_Review-g'],div.srHead > a[href*='_Review-g']",'tripadvisor');
}
