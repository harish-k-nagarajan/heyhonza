import {useLayoutEffect, type ReactNode} from "react";

import {LocaleProvider} from "@/components/i18n/LocaleProvider";
import {applyDesignToRoot} from "@/lib/design/apply";
import {
  SHIPPED_BODY_FONT,
  SHIPPED_DESIGN,
  SHIPPED_DISPLAY_FONT,
} from "@/lib/design/registry";
import {useSettingsStore} from "@/stores/useSettingsStore";

import {dotoFamily, interFamily} from "./fonts";

function stampDesign() {
  const root = document.documentElement;
  root.style.setProperty("--font-doto", dotoFamily);
  root.style.setProperty("--font-inter", interFamily);
  root.style.setProperty("--f-doto", dotoFamily);
  root.style.setProperty("--f-inter", interFamily);
  applyDesignToRoot(SHIPPED_DESIGN, SHIPPED_DISPLAY_FONT, SHIPPED_BODY_FONT, root);
  root.lang = "cs";
  root.setAttribute("data-ui-locale", "cs");
  useSettingsStore.setState({uiLocale: "cs"});
}

export function FilmProviders({children}: {children: ReactNode}) {
  useLayoutEffect(() => {
    stampDesign();
    const unsub = useSettingsStore.persist.onFinishHydration(() => {
      useSettingsStore.setState({uiLocale: "cs"});
      stampDesign();
    });
    return unsub;
  }, []);

  return <LocaleProvider locale="cs">{children}</LocaleProvider>;
}
