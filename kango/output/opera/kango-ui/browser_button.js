kango.ui.BrowserButton=function(a){this.superclass.apply(this,arguments);this._details=a;this._button=this._addButton(a)};
kango.ui.BrowserButton.prototype=kango.oop.extend(kango.ui.ButtonBase,{_button:null,_details:null,_popupHostUrl:"kango-ui/remote_popup_host.html",_addButton:function(a){var b={disabled:!1,title:"",icon:"",badge:{},popup:{}};b.onclick=kango.func.bind(this._onClicked,this);kango.object.isString(a.icon)&&(b.icon=a.icon);kango.object.isString(a.tooltipText)&&this._setTooltipText(b,a.tooltipText);"undefined"!=typeof a.badgeBackgroundColor&&this._setBadgeBackgroundColor(b,a.badgeBackgroundColor);"undefined"!=
typeof a.badgeValue&&this._setBadgeValue(b,a.badgeValue);kango.object.isObject(a.popup)&&null!=a.popup&&this._setPopup(b,a.popup);a=opera.contexts.toolbar.createItem(b);opera.contexts.toolbar.addItem(a);return a},_removeButton:function(a){opera.contexts.toolbar.removeItem(a)},_onClicked:function(){return this.fireEvent(this.event.COMMAND)},_setTooltipText:function(a,b){a.title=b},_setIcon:function(a,b){a.icon=kango.io.getFileUrl(b)},_setBadgeValue:function(a,b){b=null!=b&&0!=b?b.toString():"";a.badge.textContent=
b},_setBadgeBackgroundColor:function(a,b){a.badge.backgroundColor=kango.string.format("rgba({0},{1},{2},{3})",b[0],b[1],b[2],b[3])},_setPopup:function(a,b){var c="",d=b.height,e=b.width;null!=b&&kango.object.isString(b.url)&&(kango.io.isLocalUrl(b.url)?c=b.url:(c=this._popupHostUrl,d+=4));a.popup.href=c;a.popup.width=e;a.popup.height=d},setTooltipText:function(a){this._details.tooltipText=a;this._setTooltipText(this._button,a)},setCaption:function(a){},setIcon:function(a){this._details.icon=a;this._setIcon(this._button,
a)},setBadgeValue:function(a){this._details.badgeValue=a;this._setBadgeValue(this._button,a)},setBadgeBackgroundColor:function(a){this._details.badgeBackgroundColor=a;this._setBadgeBackgroundColor(this._button,a)},setPopup:function(a){this._details.popup=a;null!=a&&kango.object.isString(a.url)?this._setPopup(this._button,a):(this._details.popup=null,this._removeButton(this._button),this._button=this._addButton(this._details))},getPopupDetails:function(){return this._details.popup},setContextMenu:function(){}});








kango.registerModule(function(a){var b=kango.getExtensionInfo();"undefined"!=typeof b.browser_button&&(a.ui.browserButton=new kango.ui.BrowserButton(b.browser_button),this.dispose=function(){"undefined"!=typeof a.ui.browserButton.dispose&&a.ui.browserButton.dispose();a.ui.browserButton=null})});
