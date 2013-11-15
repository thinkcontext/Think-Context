function Store(name){
    this.name = name;
    // check if already exists, if not create
    // and version is correct, if not, delete all old keys, re-init
    // check last update time, update if necessary
}
Store.prototype = {

    setItem: function(key,val){
	kango.storage.setItem(this.name + '-' + key,val);
    },

    getItem: function(key){
	return kango.storage.getItem(this.name + '-' + key);
    },
    removeItem: function(key){
	return kango.storage.removeItem(this.name + '-' + key);
    }
}

function MyExtension() {
    var self = this; // why is this here?
    // TODO check first run, update, outdated
    this.urlPrefix = 'http://localhost:5984/tc/_design/think/_view';

    this.actions = ['bcorp','strike','safe','boycott','risky','rushBoycott','bcorp']; // make this a setting
    this.templates = {
	    rushBoycott:  { 
		template: '<%= name %> is listed as an advertiser of Rush Limbaugh\'s by <a href="http://stoprush.net/" target="_blank">The Stop Rush Project</a>.  Click <%= link_to("here", url, {target: "_blank"}) %> for more information on this advertiser.'
		, title: "Rush Limbaugh Advertiser"
		, icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0E%00%00%00%0E%08%06%00%00%00%1FH-%D1%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%01%D2IDAT(%CF%85%91%BFKj%01%18%86%1F%8F%87%1B%98%9C%08)%C1U%07%E9%60%B6%E8%E0%24%92%83%834%0A%0D%82p%11%B7%86Hp%F1%2C%BA6%B4%08%8A%D0%DF%D0%E0%9F%908%88D%E2%D6%60%0D%19%A8%87%7B%CD%F2W%E7%BB%CB%EDr%2F%5E%EC%81w%FAxy%DF%8F%17%CB%B2%1E%DA%ED%F6%8Fd29%0F%85B%CBH%24%B2%A8%D7%EB%93%E5r9%12%915Y%965%B6%2C%EB%81%C1%60%F0%0A%88%A6irpp%20%9A%A6%09%20%DDnW60Q%3A%9D%CE%07%C0%C9%C9%09%B7%B7%B7T*%15%A2%D1(wwwl%60%C1%F3%F3%F3%D8%EDv%0B%20GGG%92%C9d%A4V%AB%C9l6%DB%948BD%86%BD%5EO%F2%F9%BC%EC%EE%EE%0A%20%3B%3B%3BR%ADV7%1Am%C5bqj%9A%A6%23%95J%A1%EB%3A%8DF%83%5C.%87%DF%EF'%18%0C%22%22%00%ACV%2B%BC%5E%2Fgggh%9A6%C60%8C)%20%C7%C7%C7%D2j%B5%E4%E2%E2BTU%95p8%2C%C0%9A%B6%B6%B6%E4%ED%EDm%C4%CB%CB%CB%D8%E7%F3%FDst%3A%9Druu%25%80d%B3%D9%3F%FD%12%89%84%00rss%F3S%DD%DF%DF%97v%BB%CD%F5%F55%8F%8F%8Fx%3C%1ENOOyzz%02%608%1C%D2%EF%F7%99L%26%98%A6%09%80%DF%EF%FF%E0%F7%B0k4%9B%CD%B5%9A%9A%A6I%A1P%90%D5j5R%F8%82h4%CA%E5%E5%25.%97%0B%87%C3A%3A%9D%C6n%B7%F3e%E2%E7%8F%E5rY%00%09%04%022%9DNG%0A%F0%ED%7FI%9F3%CCf3%00%CE%CF%CF%89%C7%E3%DC%DF%DFS*%95%B6%ED%86a%7C%B7%D9l%00%EF%7F%CB%B2%AC%B9%A2(%12%8B%C5%E6%BA%AE%BF%AA%AA%FA~xx%B8%D8%DB%DB%93%C5b%F1%FE%0B%5C%E1%941Sm%16%E9%00%00%00%00IEND%AEB%60%82"
		, tcstat: 'grb'
	    }
	, bcorp: {
	    template: " <%= link_to(name, url, {target: \"_blank\"}) %> is a B Corporation"
	    ,title:"B Corporation"
	    ,icon:"data:image/x-icon,GIF89a%10%00%10%00%B3%00%00%FF%FF%FF%05%00%00%BA%B8%B8xvv%DB%DB%DB1-.%CA%CA%CA%17%13%14%23%20!%ED%ED%ED%3D%3B%3CKIJ%88%86%86ZXY%A9%A7%A7%00%00%00!%F9%04%00%00%00%00%00%2C%00%00%00%00%10%00%10%00%00%04q%10%C8i%8403%CF%81%82%0F%C8%A0%01Iq%0C%84D%0CG%91dEAX%16F%C4%DB%91~%DE%02%10'IH%12%10H%18%01%0C%07%60%08%A4%00E%89%23%F9K%0A%02%93%40A%A18(%B2%16%2C%B11%18%2C%A2%D0%8B%93h%94%14D%04%EA0-1%1C%18%80e%5E%07%E5%B9%80%22n24%17%3F8%13%25'O%2B-%2F%1A%1C%3Cs%23u5%23%11%00%3B"
	    ,tcstat:"brb"}
	    , green: {
		title: 'Member of the Green Business Network'
		, icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0E%00%00%00%0E%08%02%00%00%00%90*%BA%86%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%04%0D%147%1B%B2%8AZ%25%00%00%02%14IDAT(%CF-%92%CDKTa%18G%7F%CFs%EF%9D%99%06%AF%1A%834jjH*%E1%A6E%05%92P1%D4*(%C5%88%AC%A0E%8E%D4*h%A1%11%D1%26%AD%20BH%D2e%B4%C9%02%0D%A9%24%2C%0A%0A%CC%D2Md%99%18%86%86%E3%8CC%8C%9F%C3%9D%EB%FB%BEO%8B%E9%2F8%87%C3!%11%11%11%22%CA%AA%EC%E4%D2%F8h%E6%C5ln%DA%D7%5Ey%B0%AA%D1%8D%1D%8E%1E%8B%16D%01%88%08%19c%88%E8%7Bj%EA%CEr%E7%1CM%DB%16%13%98%00%031%A2%DD%ADHS%E8B%5B%DDe%00%24%22S%A9o%F1%E4%C9P%C0%11%01%00%26%16%40%C4%00%20%90%26%D5%24%17%AF%EC%E9%A0%F5%DCZ%DB%CF%96%943%2F%02%0D9Q%DCZ%1F%DEk%C4%7C%CDN%BCZy%16%60%07%02(%EE%ADxj%C5%DA%0F%0D%FB%8F%19%96%2F%5B%BD%BB%06%9A%23g%12%B9%84C%C1s%25m%95%81%9A%D1%B5%E7%0E%DB%DARK%99%94%E5%B6Z%E9%E0%22%81%1A%DC%D8%F9%92x_%F2%FE%BDd%E7%9B%B5ae%CC%EEm%B5%13%1Bc9%E31qB%FF%B1%E7%CC%0C%83%01%D4%86%EA%01%BC%5E%1D%0Cr%B0%22P%F79%3B6%B99%EEK%0E%00%04%1C%80%ADm%05%00%80M%0E%00O%3C%CFxw%2B%FBK%9D2%26%8E%CF%B5%CCzS%02%22%08%17%AB%88%40%00%2C%FA%F3%00%F6%85%1B%89%E8%D2%EFS%03%7F%1F)Q%06%F9%0E%10%C0n(82%24%BF%2C%D8%EFWG%E2%3B%AE%5E%2B%EF%DA%99%AEb%E2%E3%DB%5B%00%C9%03%85%24%B0%EAZ%7D%DD%FD%23%99!%B0Q%F0%DF%AE%BCt%B9h%7F%C1%C1%88S%D2%B3%D4E%C4_6%3El%9A%F5-%F1%DB%8B%3B%C8hs%EB%C7%F5w%D6%20%09%0B%84%88-X%02%A3E3q%DE%ADLU%3F%ACy%C2%C4t%A3%AE%FB%80%7FTi-%24%80%E4%15%09009%ED%95%EA%EA%9B%D1%9E%C2P%E1%FF%07%94R%9F%D2%1F%1F%2C%DC%5Ev%17%98%F2%7D%C8%CE%86%CF%16%B57W%9C.%0C%16%89%C8%3F%84%3F%06%BA%D7%23%A7%E0%00%00%00%00IEND%AEB%60%82"
		, tcstat: 'bsg'
		, template: '<a target="_blank" href="http://<%= url %>"><%= title %></a> - <%= desc %>'
	    }
	
	, safe: {
	    title: 'Patronize'
	    , icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%10%00%00%00%0E%08%06%00%00%00%26%2F%9C%8A%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%02%16%157%25zq%08%87%00%00%02cIDAT(%CF%8D%92%5DH%93%01%14%86%DF%F3%7D%FB%DC%B75%DD%CC%BF%CA4%0C%23r%92%14A%19%14H%CA%FC%F94mSg%12X%8D%E5%D4B*%CD%AC%8B%C2%D22%AA%0B%ED%17%89%10%C2%8BZ%5D4%12%C2%FB%C4%A4%1F%D1%22%90%EA%C2%BF%A2%D2%89%B9%E9%DCw%BA%88F%81%D0%CE%D5%CB%81%07%CEy%DF%97%10%E6%98%9E%E4%C1%C0%A4%D3%89j%FD7%BFto%BA%FC%E9%17%00%10%C2%81%0D%EE%02%CC%94%F4%02%02%D7%AD%93%D4%D6D%5D%E0%0Dz%0A%0B%C1%00%FD%0F%8Ex%A0%60%B1%D2%03%BD%3B%7FK%92%C4%AF2%E4%25%04%990%3C%A6%F5E%8C%C7o%A5%B0%EE%BFV%B4%D2%B4%26%F8)%D3%18%88%22%01%3C%F3%83h~(%E9%ED%1E%A4%E6%86%5E%90%DC%0A%00%40%F3H%09q%BA%06%05h-%11%8D%A4%DE%DA%20%07%A3%E6%40%3C%E5%05M%0E%98%FC%BB%82)'%AF%B65M%09%00%20w%15%20%60%F5%00%9C%83%25%9B%07%00%20%3B%F3%E0%BB%E2%81~v%D1%16%1D%19%2C%5B%D0%00%D3%8BDc%FDZ%E4K%E6s%1D%EDg%FA%80%BF%3C%90%3B%14%A7%A8%C7e%F53r%7C-%9EA%00%20%AB%25-%D2%2C%8C%C4n%03%40%E0%F9%11%A2%F4%8F%EB%DD%7Dw%3Bm%00PU%DD%F4%3B%05%F9%94%B2W%D2%A2S6%AA%26A%CB%CF5%F6%DC%12%24gi%A5xrK%9B%09%B3%20%FE%3E%CEd%7C%17%3Dj%5E%91%D0%00%005%C7%CF%E3%FE%EDK%20%7D%AD%12%AB%C6%F1%00%9B9%05D%0C%0D%B0%D4%1F%04FyH%2C%103(%8A%98%FD*%19%9EE%04%1D%89%DB%CB%DA%DB%9B%1F%5B%2Bj%E0%EE%B9%09%00%10%B37%ED%96%84i!k%C6%BB%90%1A%90%40%3C%0FP%0C%11%C5%08%ABT%0DX%FD%09%92_k%90%2Fol%BBs%BD%E5%06%00%BC%1F~%192Z%E8%ED%EE%F2%EED%C2%FE%CC%C9%D5%DD%86A%01%3C%AE%12%26%18%F01%E8%2BC%F8%C0H%9B%8B%F3%C4%08%BA%8B%00%E0%3Cz%F6%DF%88%F7UV%87%B4R%E5%BA%60%B2%2B~%B1%DA%C2%A2%CB%A2%0AN%0B%AF%B5%5B'N%9FhM%07%80%A2%D2%83%CB%F7%A4%D8%EE%04%00%F0CF%D1%A1ZWr%85%CD%0B%5B6%C7%95%17%F3%E1%BA%E6%03a%95%AD%B0%D4%11%D2V%C7%B1%1D%16G%CD%0B%EB%91%FA%C6%3F%BB*W%E3%B2%DC%2F%CDc%D4%DF%9BZg%A0%00%00%00%00IEND%AEB%60%82"
	    , tcstat: 'bsp'
	    , template: '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends patronizing this hotel.'
	}
	, boycott: {
	    title: 'Boycott'
	    , icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0E%00%00%00%0E%08%06%00%00%00%1FH-%D1%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%02%16%158%175%3EE%C8%00%00%02%11IDAT(%CFmROK%1BQ%1C%9C%97%DDP%1A%F1d%92%D3%86%08%A2%15%24%EE%06%3C%94%E4%9CO%A0%C4%D2R%AF%89%26%0A%1E%DA%1EzL%A0%08%05%11I%F6%E2!%A0%87%26%E0%C1O%91%C4%93%DEZ%F0%0F%D5C%04%83%1B%90%2C%DD%24%FB%A6%87M%13%C5%0E%3Cx%0F~%BF%99a%DE%08%0C%F1%A1Z%C5%B7%CB%CB%E0%E4%ED%ED%C7W%E7%E7i%D1%ED%CE%03%00'%26~%3A%BA%5E%7B%8CD%0E%3F%CD%CC%B4%AB%AB%AB%18%E1%AA%5EW%3A%F9%7C%AA%A7%EBw%F4%FB%C9P%88%5CZ%F2N(D%AA*%7B%BA%DE%EA%E4%F3%A9%EBFC%01%00%BC%3B%3E%86%95%CB%A5%06%9AF%06%02%94%BB%BB%92Rr%04%D7%A5%2C%97%255%8D%83h%94%9D%5C.%F5%FE%E4%04%B8)%14%82N%3C~%C7%40%80R%D7%25%8F%8E%C6KO%08d%B3)%A9it%0C%A3uS%2C%06ae2%DB%F4%FB%3D%A5J%85%9C%9E%26M%93t%DD%F1%F2%90%40%9A%A6%A4%AA%D2%CAd%B6a'%12u%86%C3c%F6%FD%7Drn%8E%2C%95%C8%C1%E0%B9r%BFO%86%C3%B4%13%89%BA*l%7B%1E%D1(%20%84%97%D4%FA%3A%20%25P*%01%24%90%CD%02%8A%E2%DDU%15%88F!l%7B%5E%C5S%90%DE%D0%C6%86%F7.%97%3D%C2l%16%F0%F9%9EM%8E%AD%F6%FB%2Fm%ED%EDy%B6Ms%94%F0%C8%AA%13%8B%D5%5E%9F%9E%BE%E5%C1%01E6%2BF%CA%AA%0A%E4r%9E%D2%CE%0E09%09%DE%DFSX%96%F8%13%8B%D5pS(%04%7B%86%D1%A2%A6y%91%FF%E7%2BX%A9P..J%06%02t%E2%F1%D6%EFb1%E8%FB%A2%EBm%3B%99%5Cs%15%05byY%D04%09%D7%1D%87E%82%0F%0F%14%17%17%C2%9D%9A%82%9DL%AE%7D%5DXh%7B%95k4%14ks3%E5%E8z%8B%AA%FA%B2r~%3F%1D%C3hY%5B%5B%A9%EBfS%01%00%F1%2F%A6t%B5%8A%EFWW%5E%C9%CF%CE%D2%A2%DB%7D3%2C%F9%2F%C70j%8F%91%C8%E1%E7%D9%D9%F6%8F%95%15%00%C0_%2BU%98vo%FA%E3%97%00%00%00%00IEND%AEB%60%82"
	    , tcstat: 'bsp'
	    , template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends boycotting this hotel.'
	}
	, risky: {
		title: 'Risky'
		, icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0E%00%00%00%0E%08%06%00%00%00%1FH-%D1%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%04%0D%14%05%2By%23%3E%F8%00%00%01dIDAT(%CF%85%91%CD.%04A%14%85%BFS%D53%C3%0C%0B!%13%3F%0B%B1%20%EC%11%2F%E0%11%C4%5B%D8Hx%05%966%DEC%2CDb%3D%89x%00%0B%11%B1%C0%86%09%86f%BA%AB%AB%2C%BA%87L%9BPI%A5n%EE%C9w%CFI%5D%00%8C%0C%00g%0B%93%D5%D8%9A%EDD%3AO!v%E0%12%E9%EA%D3%E8%A0%5D%AD%2C%02%CCI%000%DA%18%01%E0%B1%DEXs%10%7C~%7D%06i%06%9F%1E%7C%D1%0Bo%91%DD%01hBN%3F%D5%1Bk%FE%07%0A%1E%C2Cmhzwu%BE%E2J%FDwk%F7%008%5D%9A%A9%96%C5%0C%C2%D1%C2d%0D%20E%A1%3C%B4c%EC%3A%B15%DBe%A1%80%3B%19%BC%0C%D0%7CWj)%91%CEm%08%2B%EA%E5%06%DE%A2h%13%85g%8BiW%D2%F4%22%A2%FF%84%3C%0Aqyj*%DA%AD%89%F1%06%402%20%8D%87%60%04%D5%D2%40l%60%AC%F9%F2%3C%C2%1F%C7x%E9f%90%20%23%FE%019%F9%95%BF%AF%E8%2B%09%10%9Cto%E2(%3A%ECs%02%1Cp%DD%9C%E8%00d%D2%BDzB%FE%C8Y%B3%AF%FC%17%EDN%DDe%FB%3D%F8%23%B2%C7%A0%24w%08%BE%EE%B2%8Do7%B8%AD%C1%1CS%C5%A4wk%F7%8A%FD%F9%01%3B%F5%5E%84%AE%B8%B9%9C%9D%1A%5E%EE9%CC%16%F0%AB%B5%EB%5D%A9%95%95%C0D%DC%C5%91%D9%02X-%98%2F%2F%FC%D3%92%82%D2%F1%60%00%00%00%00IEND%AEB%60%82"
		, tcstat: 'bsp'
		, template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> advises that there is a risk of a labor dispute at this hotel.'
	    }
	, strike: {
	    title: 'Strike'
	    , icon: "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%0E%00%00%00%0E%08%06%00%00%00%1FH-%D1%00%00%00%01sRGB%00%AE%CE%1C%E9%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0B%13%00%00%0B%13%01%00%9A%9C%18%00%00%00%07tIME%07%DB%02%16%158%175%3EE%C8%00%00%02%11IDAT(%CFmROK%1BQ%1C%9C%97%DDP%1A%F1d%92%D3%86%08%A2%15%24%EE%06%3C%94%E4%9CO%A0%C4%D2R%AF%89%26%0A%1E%DA%1EzL%A0%08%05%11I%F6%E2!%A0%87%26%E0%C1O%91%C4%93%DEZ%F0%0F%D5C%04%83%1B%90%2C%DD%24%FB%A6%87M%13%C5%0E%3Cx%0F~%BF%99a%DE%08%0C%F1%A1Z%C5%B7%CB%CB%E0%E4%ED%ED%C7W%E7%E7i%D1%ED%CE%03%00'%26~%3A%BA%5E%7B%8CD%0E%3F%CD%CC%B4%AB%AB%AB%18%E1%AA%5EW%3A%F9%7C%AA%A7%EBw%F4%FB%C9P%88%5CZ%F2N(D%AA*%7B%BA%DE%EA%E4%F3%A9%EBFC%01%00%BC%3B%3E%86%95%CB%A5%06%9AF%06%02%94%BB%BB%92Rr%04%D7%A5%2C%97%255%8D%83h%94%9D%5C.%F5%FE%E4%04%B8)%14%82N%3C~%C7%40%80R%D7%25%8F%8E%C6KO%08d%B3)%A9it%0C%A3uS%2C%06ae2%DB%F4%FB%3D%A5J%85%9C%9E%26M%93t%DD%F1%F2%90%40%9A%A6%A4%AA%D2%CAd%B6a'%12u%86%C3c%F6%FD%7Drn%8E%2C%95%C8%C1%E0%B9r%BFO%86%C3%B4%13%89%BA*l%7B%1E%D1(%20%84%97%D4%FA%3A%20%25P*%01%24%90%CD%02%8A%E2%DDU%15%88F!l%7B%5E%C5S%90%DE%D0%C6%86%F7.%97%3D%C2l%16%F0%F9%9EM%8E%AD%F6%FB%2Fm%ED%EDy%B6Ms%94%F0%C8%AA%13%8B%D5%5E%9F%9E%BE%E5%C1%01E6%2BF%CA%AA%0A%E4r%9E%D2%CE%0E09%09%DE%DFSX%96%F8%13%8B%D5pS(%04%7B%86%D1%A2%A6y%91%FF%E7%2BX%A9P..J%06%02t%E2%F1%D6%EFb1%E8%FB%A2%EBm%3B%99%5Cs%15%05byY%D04%09%D7%1D%87E%82%0F%0F%14%17%17%C2%9D%9A%82%9DL%AE%7D%5DXh%7B%95k4%14ks3%E5%E8z%8B%AA%FA%B2r~%3F%1D%C3hY%5B%5B%A9%EBfS%01%00%F1%2F%A6t%B5%8A%EFWW%5E%C9%CF%CE%D2%A2%DB%7D3%2C%F9%2F%C70j%8F%91%C8%E1%E7%D9%D9%F6%8F%95%15%00%C0_%2BU%98vo%FA%E3%97%00%00%00%00IEND%AEB%60%82"
		, tcstat: 'bsp'
		, template:  '<a target="_blank" href="http://www.hotelworkersrising.org/">Hotel Workers Rising</a> recommends boycotting this hotel.'
	    }
	}; // preload templates, store as single document
    
    var templates = this.templates;
    var kinds = { domain: new Store('domain')
		   , googleplus: new Store('googleplus')
		   , glatlng: new Store('glatlng')
		   , yelp: new Store('yelp')
		   , tripadvisor: new Store('tripadvisor')
		   , hcom: new Store('hcom')
		   , facebook: new Store('facebook')
		   , gcid: new Store('gcid')
		};
//    this.load();


    function do_reply(data,event){
	var reply, kind = data.kind, key = data.key,action;
	reply = kinds[kind].getItem(key);
	if(reply){
	    console.log(kind,key);
	    reply.request = data;
	    reply.templates = {};
	    for(var c in reply.campaigns){
		console.log(c);
		action = reply.campaigns[c].action
		reply.templates[action] = templates[action];
	    }
	    console.log(reply)
	    event.target.dispatchMessage('content',reply);
	}
    }

    // open for business, listen for requests
    kango.addMessageListener('content2background'
			     , function(event){
				 var data = event.data, reply;
				 console.log(data.kind);
				 if(data.kind == 'domain' || data.kind == 'domainpop'){
				     var dp = self.getDP(data.key), domain = dp[0], path = dp[1];
				     var pathmatch = false,action;

				     if(!path){
					 path = '/';
				     }
				     console.log(dp);
				     reply = kinds['domain'].getItem(domain);
				     console.log(reply);
				     
				     if(reply){
					 reply.request = data;
					 reply.templates = {};
					 for(var c in reply.campaigns){
					     console.log(c);
					     for(var p in reply.campaigns[c]){
						 console.log(p,path);
						 if(path.indexOf(p) == 0){
						     reply.campaigns[c] = reply.campaigns[c][p];
						     action = reply.campaigns[c].action;
						     reply.templates[action] = templates[action];					 
						     console.log(action,templates[action]);
						     pathmatch = true;
						     break;
						 }
					     }
					 }
					 if(pathmatch)
					     event.target.dispatchMessage('content',reply);
				     }
				 } else if(kinds[kind]){
				     do_reply(data,event);
				 }
			     });
 
    kango.ui.browserButton.addEventListener(kango.ui.browserButton.event.COMMAND, function() {
	self._onCommand();
    });
}

MyExtension.prototype = {
    _onCommand: function(){ 
	console.log('button push');
	kango.dispatchMessage('buttonPush','foo');
    }
    , loadTemplates: function(){
//	this.templates = kango.storage.getItem('templates').templates;
	$.getJSON(this.urlPrefix + '/templatesAll'
		  , function(data){
		      
		      });
    },

    load: function(){
	var self = this;
	console.log('load');
	$.getJSON(this.urlPrefix + '/dataByCampaign'
		  ,function(data){
		      var k, rows = data.rows, val;
		      if(rows.length > 0){
			  kango.storage.clear(); // only clear if there's data
			  var maxTime = '2000-01-01 01:01:01 -0400';
			  for(var k in rows){
			      val = rows[k].value;
			      delete val._id;
			      delete val._rev;
			      delete val.type;
			      delete val.status;
			      kango.storage.setItem(rows[k].id,rows[k].value);
			      if(rows[k].value.date_added > maxTime)
				  maxTime = rows[k].value.date_added;
			  }
			  kango.storage.setItem('metaTime',maxTime);
			  self.loadTemplates();
		      }
		  });
    },
    update: function(){
	var d = new Date, self = this;
	$.getJSON(this.urlPrefix + '/updatebycampaign?startkey="' + kango.storage.getItem('metaTime') + '"&endkey="'+ d.toJSON()+'"'
		  ,function(data){
		      var k, rows = data.rows, key;
		      var maxTime = kango.storage.getItem('metaTime');
		      for(var k in rows){
			  key = rows[k].id
			  switch(rows[k].value.status = 'D'){
			  case 'D':
			      kango.storage.removeItem(key);
			      break;
			  case 'A':
			      kango.storage.setItem(key,rows[k].value);
			      break;
			  default:
			      continue;
			  }
			  if(rows[k].value.date_modified > maxTime)
			      maxTime = rows[k].value.date_modified;
		      }
		      kango.storage.setItem('metaTime',maxTime);
		      self.loadTemplates();		      
		  });
    },
    getDP: function(d){
	var m = d.match(/^(www\.)?([^\/]+\.[^\/]+)(\/.*$)?/);
	if(m.length >= 3){
	   return [m[2].toLowerCase(),m[3]];
	}
    }
    
};

var extension = new MyExtension();

