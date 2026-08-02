/**
 * Pre-paint design resolver. Renders a synchronous inline `<script>` placed as
 * the first child of `<body>`, so it runs and stamps `<html>` *before* the
 * browser paints any content — no flash of Classic on a cold load of a
 * non-Classic design.
 *
 * It is deliberately standalone (no imports): it re-implements, in plain ES5,
 * the same whitelist + fallback logic as `@/lib/design/apply` and
 * `@/lib/design/registry`. The two must stay in lockstep — the tables below are
 * mirrors of `DESIGN_IDS`, `FONTS[*].cssVar`, and each design's default faces.
 * Anything invalid, missing, or corrupt resolves to Classic (no attribute), and
 * any thrown error leaves `:root` (Classic) untouched.
 */
const SCRIPT = `(function(){try{
var KEY="honza-design";
var DESIGNS=["classic","hmat-metal","hmat-ceramic"];
var FV={"share-tech-mono":"--f-share-tech-mono","geist-sans":"--f-geist-sans","geist-pixel-square":"--f-geist-pixel-square","doto":"--f-doto","jetbrains-mono":"--f-jetbrains-mono","ibm-plex-sans":"--f-ibm-plex-sans"};
var LEG={"geist-mono":"jetbrains-mono","geist-pixel-grid":"geist-pixel-square","geist-pixel-circle":"geist-pixel-square","geist-pixel-line":"geist-pixel-square","geist-pixel-triangle":"geist-pixel-square","press-start-2p":"doto","syne-mono":"share-tech-mono","space-mono":"jetbrains-mono","roboto-mono":"jetbrains-mono","dm-sans":"geist-sans","space-grotesk":"geist-sans","alan-sans":"geist-sans"};
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
el.style.setProperty("--font-display","var("+FV[df]+")");
el.style.setProperty("--font-body","var("+FV[bf]+")");
}catch(e){}})();`;

export function DesignScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
