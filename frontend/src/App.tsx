import React, { createContext, Dispatch, useCallback, useEffect, useLayoutEffect, useReducer, useState } from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";

import * as Constants from "./Constants";
import { i18nNamespace } from "./services/i18n";
import { supportedLanguages } from "./Data";
import { ExternalLocaleState, externalLocaleReducer, initialExternalLocaleState } from "./actions/ExternalLocale";
import { GlobalStyle } from "./styles/GlobalStyle";
import "./scss/custom.scss";
import Toaster, { addToast as toast, ToasterTypes } from "./layout/Toaster";
import { NavState } from "./layout/NavToggle";
import Overlay, { OverlayState } from "./layout/Overlay";
import Theme, { Themes, availableThemes } from "./tools/Themes";
import BackTop from "./tools/BackTop";

export enum AppAction {
  TOAST,
  SET_THEME,
  SET_LANGUAGE,
  SHOW_OVERLAY,
  HIDE_OVERLAY,
  OPEN_NAV,
  CLOSE_NAV,
  LOG,
}

export type AppActions = { type: AppAction.TOAST; toast: ToasterTypes; message: string };

type AppState = {
  testMode: boolean;
  theme: Themes;
  language: string;
};

const initialAppState: AppState = JSON.parse(localStorage.getItem("appState") ?? "null") || {
  testMode: process.env.NODE_ENV === "test",
  theme: window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? Themes.LIGHT : Themes.DARK,
  language: Constants.DEFAULT_LANG,
};

const appReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    case AppAction.TOAST:
      toast(action.message, action.toast);
      return state;
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppActions>;
  testMode: boolean;
  theme: Themes;
  getTheme: (value: Themes) => Theme;
  setTheme: (value: Themes) => void;
  navState: NavState;
  setNavState: (value: NavState) => void;
  externalLocaleState: ExternalLocaleState;
  language: string;
  setLanguage: (value: string) => void;
  dispatchExternalLocaleState: Dispatch<ExternalLocaleState>;
  setOverlayState: (value: OverlayState) => void;
  toast: (message: string, type: ToasterTypes) => React.ReactText;
  logEvent: (event: Record<string, string>, debug?: boolean) => void;
}>({
  state: initialAppState,
  dispatch: () => null,
  testMode: false,
  theme: Themes.DARK,
  getTheme: () => availableThemes[Themes.DARK],
  setTheme: () => null,
  navState: NavState.CLOSED,
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
  const [state, dispatch] = useReducer(appReducer, initialAppState);

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
    setOverlayState(navState === NavState.OPEN ? OverlayState.SHOW : OverlayState.HIDE);
  }, [navState]);

  useEffect(() => {
    localStorage.setItem("theme", theme.toString());
  }, [theme]);

  useEffect(() => {
    changeLanguageHandler(language);
  }, [language, changeLanguageHandler]);

  useLayoutEffect(() => {
    localStorage.setItem("externalLocaleState", JSON.stringify(externalLocaleState));

    supportedLanguages.forEach((lang) => {
      if (externalLocaleState.data && externalLocaleState.data[lang] !== undefined) {
        i18n.addResourceBundle(lang, i18nNamespace.EXTERNAL, externalLocaleState.data[lang]);
      }
    });
  }, [i18n, externalLocaleState]);

  const appContext = {
    state,
    dispatch,
    testMode,
    theme,
    getTheme,
    setTheme,
    navState,
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
    <HelmetProvider>
      <ThemeProvider theme={availableThemes[theme]}>
        <AppContext.Provider value={appContext}>
          <Outlet />
          <Overlay state={overlayState as OverlayState} />
          <BackTop textColor={getTheme(theme).text} backgroundColor={getTheme(theme).background} />
          <Toaster theme={theme === Themes.LIGHT ? "light" : "dark"} />
          <GlobalStyle />
        </AppContext.Provider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
