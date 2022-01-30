import React, { createContext, Dispatch, Suspense, useCallback, useEffect, useReducer, useState } from "react";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";

import i18next, { i18nNamespace } from "./services/i18n";
import * as Constants from "./Constants";
import Dapp from "./Dapp";
import { supportedLanguages } from "./Data";
import { ExternalLocaleState, externalLocaleReducer, initialExternalLocaleState } from "./actions/ExternalLocale";
import { GlobalStyle } from "./styles/GlobalStyle";
import "./scss/custom.scss";
import Toaster, { addToast as toast, ToasterTypes } from "./layout/Toaster";
import { NavState } from "./layout/NavToggle";
import Overlay, { OverlayState } from "./layout/Overlay";
import LoaderSpinner from "./components/LoaderSpinner";
import Theme, { Themes, availableThemes } from "./tools/Themes";
import BackTop from "./tools/BackTop";

export const AppContext = createContext<{
  testMode: boolean;
  theme: Themes;
  getTheme: (value: Themes) => Theme;
  setTheme: (value: Themes) => void;
  navState: NavState;
  toggleNav: (override?: NavState, overlay?: boolean) => void;
  setNavState: (value: NavState) => void;
  externalLocaleState: ExternalLocaleState;
  language: string;
  setLanguage: (value: string) => void;
  dispatchExternalLocaleState: Dispatch<ExternalLocaleState>;
  setOverlayState: (value: OverlayState) => void;
  toast: (message: string, type: ToasterTypes) => React.ReactText;
  logEvent: (event: Record<string, string>, debug?: boolean) => void;
}>({
  testMode: false,
  theme: Themes.DARK,
  getTheme: () => availableThemes[Themes.DARK],
  setTheme: () => null,
  navState: NavState.CLOSED,
  toggleNav: () => null,
  setNavState: () => null,
  externalLocaleState: initialExternalLocaleState,
  language: Constants.DEFAULT_LANG,
  setLanguage: () => null,
  dispatchExternalLocaleState: () => undefined,
  setOverlayState: () => null,
  toast: () => "",
  logEvent: () => null,
});

const App: React.FunctionComponent = (): JSX.Element => {
  const { i18n } = useTranslation();

  const testMode: boolean = process.env.NODE_ENV === "test";
  const isLightScheme = window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches;
  const sysTheme: Themes = isLightScheme ? Themes.LIGHT : Themes.DARK;
  const localExternalLocaleState: ExternalLocaleState = {
    ...initialExternalLocaleState,
    ...JSON.parse(localStorage.getItem("externalLocaleState") ?? "{}"),
  };

  const [theme, setTheme] = useState(parseInt(localStorage.getItem("theme") ?? sysTheme.toString()));
  const [language, setLanguage] = useState(localStorage.getItem("language") ?? i18n.language ?? Constants.DEFAULT_LANG);
  const [navState, setNavState] = useState(NavState.CLOSED);
  const [overlayState, setOverlayState] = useState(OverlayState.HIDE);
  const [externalLocaleState, dispatchExternalLocaleState] = useReducer(
    externalLocaleReducer,
    localExternalLocaleState
  );

  const getTheme = (theme: Themes): Theme => {
    return availableThemes[theme];
  };

  const toggleNav = (override?: NavState, overlay?: boolean) => {
    const state = override ?? navState === NavState.CLOSED ? NavState.OPEN : NavState.CLOSED;

    setNavState(state);

    if (overlay) {
      setOverlayState(state === NavState.OPEN ? OverlayState.SHOW : OverlayState.HIDE);
    }
  };

  const logEvent = (event: Record<string, string>, debug = false) => {
    return null;
  };

  const changeLanguageHandler = useCallback(
    (lang: string): void => {
      if (i18n.language !== lang) {
        i18n.changeLanguage(lang);
        localStorage.setItem("language", lang);
      }
    },
    [i18n]
  );

  useEffect(() => {
    localStorage.setItem("theme", theme.toString());
  }, [theme]);

  useEffect(() => {
    changeLanguageHandler(language);
  }, [language, changeLanguageHandler]);

  useEffect(() => {
    localStorage.setItem("externalLocaleState", JSON.stringify(externalLocaleState));
    supportedLanguages.forEach((lang) => {
      if (externalLocaleState.data && externalLocaleState.data[lang] !== undefined) {
        i18next.addResourceBundle(lang, i18nNamespace.EXTERNAL, externalLocaleState.data[lang]);
      }
    });
  }, [externalLocaleState]);

  const appContext = {
    testMode,
    theme,
    getTheme,
    setTheme,
    navState,
    toggleNav,
    setNavState,
    externalLocaleState,
    language,
    setLanguage,
    dispatchExternalLocaleState,
    setOverlayState,
    toast,
    logEvent,
  };

  return (
    <Suspense fallback={<LoaderSpinner type="Pulse" size={20} />}>
      <ThemeProvider theme={availableThemes[theme]}>
        <AppContext.Provider value={appContext}>
          {/* {window.location.host.split(".")[0] === "app" ? <Dapp /> : <Wapp />} */}
          <Dapp />
          <Overlay state={overlayState as OverlayState} />
          <BackTop textColor={getTheme(theme).text} backgroundColor={getTheme(theme).background} />
          <Toaster theme={theme === Themes.LIGHT ? "light" : "dark"} />
          <GlobalStyle />
        </AppContext.Provider>
      </ThemeProvider>
    </Suspense>
  );
};

export default App;
