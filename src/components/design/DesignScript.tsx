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
var FV={"share-tech-mono":"--f-share-tech-mono","geist-sans":"--f-geist-sans","geist-mono":"--f-geist-mono","geist-pixel-square":"--f-geist-pixel-square","geist-pixel-grid":"--f-geist-pixel-grid","geist-pixel-circle":"--f-geist-pixel-circle","geist-pixel-line":"--f-geist-pixel-line","geist-pixel-triangle":"--f-geist-pixel-triangle"};
var DEF={"classic":["share-tech-mono","share-tech-mono"],"hmat-metal":["geist-pixel-square","geist-sans"],"hmat-ceramic":["geist-pixel-square","geist-sans"]};
var design="classic",df="share-tech-mono",bf="share-tech-mono";
var raw=localStorage.getItem(KEY);
if(raw){var s=(JSON.parse(raw)||{}).state||{};
if(DESIGNS.indexOf(s.design)!==-1)design=s.design;
var d=DEF[design];
df=FV[s.displayFont]?s.displayFont:d[0];
bf=FV[s.bodyFont]?s.bodyFont:d[1];}
var el=document.documentElement;
if(design==="classic")el.removeAttribute("data-design");else el.setAttribute("data-design",design);
el.style.setProperty("--font-display","var("+FV[df]+")");
el.style.setProperty("--font-body","var("+FV[bf]+")");
}catch(e){}})();`;

export function DesignScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
