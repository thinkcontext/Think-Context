tc.popSend();
var h = new tc.urlHandle(document.URL);
if(h.kind == 'imdb'){
    tc.handleExamine("a[href*='title/tt']:not([href*='"+h.hval+"'])",'imdb');
} else {
    tc.handleExamine("a[href*='title/tt']",'imdb');
}
