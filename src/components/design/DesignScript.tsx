/**
 * Pre-paint design resolver. Renders a synchronous inline `<script>` placed as
 * the first child of `<body>`, so it runs and stamps `<html>` *before* the
 * browser paints any content — no flash of Classic on a cold load of a
 * non-Classic design.
 */
const SCRIPT = `(function(){try{
var KEY="honza-design";
var DESIGNS=["classic","hmat-metal","hmat-ceramic"];
var FV={"share-tech-mono":"--f-share-tech-mono","geist-sans":"--f-geist-sans","geist-mono":"--f-geist-mono","geist-pixel-square":"--f-geist-pixel-square","doto":"--f-doto","jetbrains-mono":"--f-jetbrains-mono","ibm-plex-sans":"--f-ibm-plex-sans","alan-sans":"--f-alan-sans","dm-sans":"--f-dm-sans","space-grotesk":"--f-space-grotesk","space-mono":"--f-space-mono"};
var LEG={"geist-pixel-grid":"geist-pixel-square","geist-pixel-circle":"geist-pixel-square","geist-pixel-line":"geist-pixel-square","geist-pixel-triangle":"geist-pixel-square","press-start-2p":"doto","syne-mono":"share-tech-mono","roboto-mono":"jetbrains-mono"};
var DW={"share-tech-mono":[400,400],"geist-pixel-square":[400,400],"doto":[500,700]};
function norm(v,f){return FV[v]?v:(LEG[v]||f);}
var DEF={"classic":["share-tech-mono","share-tech-mono"],"hmat-metal":["geist-pixel-square","geist-sans"],"hmat-ceramic":["geist-pixel-square","geist-sans"]};
var design="hmat-metal",df="geist-pixel-square",bf="geist-sans";
var raw=localStorage.getItem(KEY);
if(raw){var s=(JSON.parse(raw)||{}).state||{};
if(DESIGNS.indexOf(s.design)!==-1)design=s.design;
var d=DEF[design];
df=norm(s.displayFont,d[0]);
bf=norm(s.bodyFont,d[1]);}
var el=document.documentElement;
if(design==="classic")el.removeAttribute("data-design");else el.setAttribute("data-design",design);
el.setAttribute("data-display-font",df);
el.setAttribute("data-body-font",bf);
var w=DW[df]||[400,400];
el.style.setProperty("--font-display","var("+FV[df]+")");
el.style.setProperty("--font-body","var("+FV[bf]+")");
el.style.setProperty("--font-display-weight",String(w[0]));
el.style.setProperty("--font-display-weight-ui",String(w[1]));
}catch(e){}})();`;

export function DesignScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
