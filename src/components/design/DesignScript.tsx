/**
 * Pre-paint design resolver — stamps Hmat Metal + Doto + Space Grotesk before
 * first paint so fonts never flash.
 */
const SCRIPT = `(function(){try{
var el=document.documentElement;
el.setAttribute("data-design","hmat-metal");
el.setAttribute("data-display-font","doto");
el.setAttribute("data-body-font","space-grotesk");
el.style.setProperty("--font-display","var(--f-doto)");
el.style.setProperty("--font-body","var(--f-space-grotesk)");
el.style.setProperty("--font-display-weight","500");
el.style.setProperty("--font-display-weight-ui","700");
}catch(e){}})();`;

export function DesignScript() {
  return <script dangerouslySetInnerHTML={{ __html: SCRIPT }} />;
}
