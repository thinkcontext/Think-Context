var window = require("sdk/window/utils").getMostRecentBrowserWindow();
 
exports.atob = function(a) {
  return window.atob(a);
}
 
exports.btoa = function(b) {
  return window.btoa(b);
}
