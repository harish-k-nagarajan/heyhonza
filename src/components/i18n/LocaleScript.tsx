/**
 * Stamp the saved UI language before React hydrates, and write the cookie so
 * the next document request SSRs the same locale (no Czech→English flash).
 */
const SCRIPT = `(function(){try{
var loc=null;
var m=document.cookie.match(/(?:^|; )honza-ui-locale=(cs|en)/);
if(m)loc=m[1];
if(!loc){
  var raw=localStorage.getItem("honza-settings");
  if(raw){
    var s=JSON.parse(raw);
    var v=s&&s.state&&s.state.uiLocale;
    if(v==="cs"||v==="en")loc=v;
  }
}
if(loc==="cs"||loc==="en"){
  document.documentElement.lang=loc;
  document.documentElement.setAttribute("data-ui-locale",loc);
  document.cookie="honza-ui-locale="+loc+"; Path=/; Max-Age=31536000; SameSite=Lax";
}
}catch(e){}})();`;

export function LocaleScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
