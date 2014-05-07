// product page amazon.com/gp/product/<ASIN>
// <a id="brand" class="a-link-normal" href="/s/ref=bl_sr_grocery?ie=UTF8&amp;field-brandtextbin=Muir+Glen&amp;node=16310101">Muir Glen</a>

var m, brand, aBrand = $("a#brand");
if(aBrand.length == 1 && m = aBrand[0].href.match(/brandtextbin=([^&]+)&/)){
    brand = decodeURIComponent(m[1]);
}