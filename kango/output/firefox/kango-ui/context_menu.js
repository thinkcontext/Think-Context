kango.ui.ContextMenuItem=function(a){this.superclass.apply(this,arguments);this._id="kango-"+kango.utils.getDomainFromId(kango.getExtensionInfo().id)+"-menu-item1";this.init(a)};
kango.ui.ContextMenuItem.prototype=kango.oop.extend(kango.ui.ContextMenuItemBase,{_id:null,init:function(a){kango.array.forEach(kango.chromeWindows.getLoadedChromeWindows(),function(b){this.addItem(b,this._id,a.caption,a.context||"all")},this);kango.chromeWindows.addEventListener(kango.chromeWindows.event.WINDOW_LOAD,kango.func.bind(function(b){this.addItem(b.window,this._id,a.caption,a.context||"all")},this));kango.chromeWindows.addEventListener(kango.chromeWindows.event.WINDOW_UNLOAD,kango.func.bind(function(a){this.removeItem(a.window,
this._id)},this))},dispose:function(){this.removeAllEventListeners();kango.array.forEach(kango.chromeWindows.getLoadedChromeWindows(),function(a){this.removeItem(a,this._id)},this)},addItem:function(a,b,c,h){var d=a.document,f=d.getElementById("contentAreaContextMenu"),e=d.createElement("menuitem");e.setAttribute("id",b);e.setAttribute("label",c);e.addEventListener("command",kango.func.bind(function(a){var b=d.popupNode;this.fireEvent(this.event.CLICK,{srcUrl:b.src,linkUrl:b.href});a.preventDefault()},
this),!1);f.appendChild(e);var g=function(){var c=d.getElementById(b);null!=c&&"image"==h&&(c.hidden=!a.gContextMenu.onImage)};f.addEventListener("popupshowing",g,!1);kango.chromeWindows.registerContainerUnloader(function(){f.removeEventListener("popupshowing",g,!1)},a)},removeItem:function(a,b){var c=a.document.getElementById(b);null!=c&&c.parentNode.removeChild(c)}});








kango.registerModule(function(a){var b=kango.getExtensionInfo();"undefined"!=typeof b.context_menu_item&&(a.ui.contextMenuItem=new kango.ui.ContextMenuItem(b.context_menu_item),this.dispose=function(){"undefined"!=typeof a.ui.contextMenuItem.dispose&&a.ui.contextMenuItem.dispose();a.ui.contextMenuItem=null})});
