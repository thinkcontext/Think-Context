kango.MessageRouter=function(){opera.extension.onmessage=kango.func.bind(this._onMessage,this)};
kango.MessageRouter.prototype={_onMessage:function(b){var a=JSON.parse(b.data),a={name:a.name,data:a.data,origin:"tab",source:{dispatchMessage:function(a,d){b.source.postMessage(JSON.stringify({name:a,data:d}));return!0}},target:kango.browser.getTabFromUrl(b.origin)};kango.fireEvent(kango.event.MESSAGE,a)},dispatchMessage:function(b,a){var c={name:b,data:a,origin:"background",source:kango,target:kango};kango.timer.setTimeout(function(){kango.fireEvent(kango.event.MESSAGE,c)},1);return!0}};








kango.registerModule(function(a){var b=new kango.MessageRouter;a.dispatchMessage=function(a,c){b.dispatchMessage(a,c)};this.dispose=function(){b=a.dispatchMessage=null}});
