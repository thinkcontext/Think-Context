if (window.top === window && !tc.found && document.domain.match(/(^|\.)wikipedia\.org$/)) {
    tc.found = true;
//tc.handleExamine("a[href*='/wiki/']",'wiki');
}
