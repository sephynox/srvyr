import React, { createContext, Dispatch, useCallback, useEffect, useLayoutEffect, useReducer } from "react";
import { Outlet } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";

import * as Constants from "./Constants";
import { i18nNamespace } from "./services/i18n";
import { supportedLanguages } from "./Data";
import { externalLocaleReducer, initialExternalLocaleState } from "./actions/ExternalLocale";
import { GlobalStyle } from "./styles/GlobalStyle";
import "./scss/custom.scss";
import Toaster, { addToast as toast, ToasterTypes } from "./layout/Toaster";
import { NavState } from "./layout/NavToggle";
import Overlay, { OverlayState } from "./layout/Overlay";
import Theme, { Themes, availableThemes } from "./tools/Themes";
import BackTop from "./tools/BackTop";

export enum AppAction {
  TOAST = "TOAST",
  SET_THEME = "SET_THEME",
  SET_LANGUAGE = "SET_LANGUAGE",
  SHOW_OVERLAY = "SHOW_OVERLAY",
  HIDE_OVERLAY = "HIDE_OVERLAY",
  OPEN_NAV = "OPEN_NAV",
  CLOSE_NAV = "CLOSE_NAV",
  LOG = "LOG",
}

enum InternalAppAction {
  PRUNE_EVENT_LOG = "PRUNE_EVENT_LOG",
  PRUNE_TOAST_QUEUE = "PRUNE_TOAST_QUEUE",
}

export type AppActions =
  | { type: AppAction.TOAST; toast: ToasterTypes; message: string }
  | { type: AppAction.SET_THEME; theme: Themes }
  | { type: AppAction.SET_LANGUAGE; language: string }
  | { type: AppAction.LOG; event: Record<string, string> }
  | { type: AppAction.SHOW_OVERLAY }
  | { type: AppAction.HIDE_OVERLAY }
  | { type: AppAction.OPEN_NAV }
  | { type: AppAction.CLOSE_NAV }
  | { type: InternalAppAction.PRUNE_EVENT_LOG }
  | { type: InternalAppAction.PRUNE_TOAST_QUEUE };

type AppState = {
  testMode: boolean;
  theme: Themes;
  language: string;
  navState: NavState;
  overlayState: OverlayState;
  eventLog: Record<string, string>[];
  toastQueue: { toast: ToasterTypes; message: string }[];
};

const hardStateResets = {
  navState: NavState.CLOSED,
  overlayState: OverlayState.HIDE,
  eventLog: [],
  toastQueue: [],
};

const initialAppState: AppState = JSON.parse(localStorage.getItem("appState") ?? "null") || {
  testMode: process.env.NODE_ENV === "test",
  theme: window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? Themes.LIGHT : Themes.DARK,
  language: Constants.DEFAULT_LANG,
  ...hardStateResets,
};

const appReducer = (state: AppState, action: AppActions): AppState => {
  switch (action.type) {
    case AppAction.TOAST:
      const toast = { toast: action.toast, message: action.message };
      return { ...state, toastQueue: [...state.toastQueue, toast] };
    case AppAction.SET_THEME:
      return { ...state, theme: action.theme };
    case AppAction.SET_LANGUAGE:
      return { ...state, language: action.language };
    case AppAction.LOG:
      return { ...state, eventLog: [...state.eventLog, action.event] };
    case AppAction.SHOW_OVERLAY:
      return { ...state, overlayState: OverlayState.SHOW };
    case AppAction.HIDE_OVERLAY:
      return { ...state, overlayState: OverlayState.HIDE };
    case AppAction.OPEN_NAV:
      return { ...state, navState: NavState.OPEN };
    case AppAction.CLOSE_NAV:
      return { ...state, navState: NavState.CLOSED };
    case InternalAppAction.PRUNE_EVENT_LOG:
      return { ...state, eventLog: [] };
    case InternalAppAction.PRUNE_TOAST_QUEUE:
      return { ...state, toastQueue: [] };
  }
};

export const AppContext = createContext<{
  state: AppState;
  dispatch: Dispatch<AppActions>;
}>({
  state: initialAppState,
  dispatch: () => null,
});

const App: React.FunctionComponent = (): JSX.Element => {
  const { i18n } = useTranslation();

  const [state, dispatch] = useReducer(appReducer, { ...initialAppState, ...hardStateResets });
  const [externalLocaleState] = useReducer(externalLocaleReducer, {
    ...initialExternalLocaleState,
    ...JSON.parse(localStorage.getItem("externalLocaleState") ?? "{}"),
  });

  const getTheme = (theme: Themes): Theme => {
    return availableThemes[theme];
  };

  const logEvents = useCallback((events: Record<string, string>[], debug = false) => {
    return null;
  }, []);

  const changeLanguageHandler = useCallback(() => {
    if (i18n.language !== state.language) {
      i18n.changeLanguage(state.language);
      localStorage.setItem("language", state.language);
    }
  }, [i18n, state.language]);

  const handleToastQueue = useCallback(() => {
    if (state.toastQueue.length > 0) {
      state.toastQueue.forEach((toaster) => {
        toast(toaster.message, toaster.toast);
      });

      dispatch({ type: InternalAppAction.PRUNE_TOAST_QUEUE });
    }
  }, [state.toastQueue]);

  useLayoutEffect(() => {
    localStorage.setItem("externalLocaleState", JSON.stringify(externalLocaleState));

    supportedLanguages.forEach((lang) => {
      if (externalLocaleState.data && externalLocaleState.data[lang] !== undefined) {
        i18n.addResourceBundle(lang, i18nNamespace.EXTERNAL, externalLocaleState.data[lang]);
      }
    });
  }, [i18n, externalLocaleState]);

  useEffect(() => {
    if (state.eventLog.length > 0) {
      logEvents(state.eventLog);
      dispatch({ type: InternalAppAction.PRUNE_EVENT_LOG });
    }
  }, [state.eventLog, logEvents]);

  useEffect(() => {
    changeLanguageHandler();
    handleToastQueue();
  }, [changeLanguageHandler, handleToastQueue]);

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  const appContext = {
    state,
    dispatch,
    getTheme,
  };

  return (
    <HelmetProvider>
      <ThemeProvider theme={availableThemes[state.theme]}>
        <AppContext.Provider value={appContext}>
          <Outlet />
          <Overlay state={state.overlayState as OverlayState} />
          <BackTop textColor={getTheme(state.theme).text} backgroundColor={getTheme(state.theme).background} />
          <Toaster theme={state.theme === Themes.LIGHT ? "light" : "dark"} />
          <GlobalStyle />
        </AppContext.Provider>
      </ThemeProvider>
    </HelmetProvider>
  );
};

export default App;
