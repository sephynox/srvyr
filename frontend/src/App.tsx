import React, { createContext, Dispatch, useCallback, useEffect, useReducer } from "react";
import { NavigateOptions, Outlet, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { ThemeProvider } from "styled-components";

import "react-loading-skeleton/dist/skeleton.css";
import "./scss/custom.scss";

import * as Constants from "./Constants";
import { GlobalStyle } from "./styles/GlobalStyle";
import { Themes, availableThemes, darkTheme } from "./styles/Themes";
import Toaster, { addToast as toast, ToasterTypes } from "./layout/Toaster";
import { NavState } from "./layout/NavToggle";
import Overlay, { OverlayState } from "./layout/Overlay";
import BackTop from "./components/BackTop";
import { localStoreOr } from "./utils/data-helpers";

export enum AppAction {
  TOAST = "TOAST",
  SET_THEME = "SET_THEME",
  SET_LANGUAGE = "SET_LANGUAGE",
  SHOW_OVERLAY = "SHOW_OVERLAY",
  HIDE_OVERLAY = "HIDE_OVERLAY",
  OPEN_NAV = "OPEN_NAV",
  CLOSE_NAV = "CLOSE_NAV",
  NAVIGATE = "NAVIGATE",
  LOG = "LOG",
}

enum InternalAppAction {
  ACK_LOG = "ACK_LOG",
  ACK_TOAST = "ACK_TOAST",
  ACK_SWITCHED_LANG = "ACK_SWITCHED_LANG",
  ACK_REQUESTED_NAVIGATION = "ACK_REQUESTED_NAVIGATION",
}

enum AppEvent {
  LISTENING = "LISTENING",
  SYN_LOG = "SYN_LOG",
  SYN_TOAST = "SYN_TOAST",
  SYN_SWITCHED_LANG = "SYN_SWITCHED_LANG",
  SYN_REQUESTED_NAVIGATION = "SYN_REQUESTED_NAVIGATION",
}

export type AppEvents =
  | { type: AppEvent.LISTENING }
  | { type: AppEvent.SYN_LOG; log: Record<string, string> }
  | { type: AppEvent.SYN_TOAST; toaster: { toast: ToasterTypes; message: string } }
  | { type: AppEvent.SYN_SWITCHED_LANG; language: string }
  | { type: AppEvent.SYN_REQUESTED_NAVIGATION; path: string; opts?: NavigateOptions };

export type AppActions =
  | { type: AppAction.NAVIGATE; path: string; opts?: NavigateOptions }
  | { type: AppAction.TOAST; toast: ToasterTypes; message: string }
  | { type: AppAction.SET_THEME; theme: Themes }
  | { type: AppAction.SET_LANGUAGE; language: string }
  | { type: AppAction.LOG; event: Record<string, string> }
  | { type: AppAction.SHOW_OVERLAY }
  | { type: AppAction.HIDE_OVERLAY }
  | { type: AppAction.OPEN_NAV }
  | { type: AppAction.CLOSE_NAV }
  | { type: InternalAppAction.ACK_LOG }
  | { type: InternalAppAction.ACK_TOAST }
  | { type: InternalAppAction.ACK_SWITCHED_LANG }
  | { type: InternalAppAction.ACK_REQUESTED_NAVIGATION };

type AppState = {
  eventHost: AppEvents;
  testMode: boolean;
  theme: Themes;
  language: string;
  navState: NavState;
  overlayState: OverlayState;
};

const initialEventHost: AppEvents = {
  type: AppEvent.LISTENING,
};

const hardStateResets = {
  eventHost: initialEventHost,
  navState: NavState.CLOSED,
  overlayState: OverlayState.HIDE,
};

const initialAppState: AppState = localStoreOr("appState", {
  testMode: process.env.NODE_ENV === "test",
  theme: window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches ? Themes.LIGHT : Themes.DARK,
  language: Constants.DEFAULT_LANG,
  ...hardStateResets,
});

const appReducer = (state: AppState, action: AppActions): AppState => {
  let event: AppEvents;

  switch (action.type) {
    case AppAction.NAVIGATE:
      event = { type: AppEvent.SYN_REQUESTED_NAVIGATION, path: action.path, opts: action.opts };
      return { ...state, eventHost: event };
    case AppAction.TOAST:
      const toast = { toast: action.toast, message: action.message };
      return { ...state, eventHost: { type: AppEvent.SYN_TOAST, toaster: toast } };
    case AppAction.SET_THEME:
      return { ...state, theme: action.theme };
    case AppAction.SET_LANGUAGE:
      event = { type: AppEvent.SYN_SWITCHED_LANG, language: action.language };
      return { ...state, eventHost: event, language: action.language };
    case AppAction.LOG:
      return { ...state, eventHost: { type: AppEvent.SYN_LOG, log: action.event } };
    case AppAction.SHOW_OVERLAY:
      return { ...state, overlayState: OverlayState.SHOW };
    case AppAction.HIDE_OVERLAY:
      return { ...state, overlayState: OverlayState.HIDE };
    case AppAction.OPEN_NAV:
      return { ...state, overlayState: OverlayState.SHOW, navState: NavState.OPEN };
    case AppAction.CLOSE_NAV:
      return { ...state, overlayState: OverlayState.HIDE, navState: NavState.CLOSED };
    case InternalAppAction.ACK_LOG:
    case InternalAppAction.ACK_TOAST:
    case InternalAppAction.ACK_SWITCHED_LANG:
    case InternalAppAction.ACK_REQUESTED_NAVIGATION:
      return { ...state, eventHost: initialEventHost };
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
  const navigate = useNavigate();

  const [state, dispatch] = useReducer(appReducer, { ...initialAppState, ...hardStateResets });

  const theme = availableThemes[state.theme] ?? darkTheme;
  const logEvents = useCallback((events: Record<string, string>[], debug = false) => {
    return null;
  }, []);

  const listenEventBus = useCallback(async () => {
    switch (state.eventHost.type) {
      case AppEvent.SYN_LOG:
        logEvents([state.eventHost.log]);
        return dispatch({ type: InternalAppAction.ACK_LOG });
      case AppEvent.SYN_TOAST:
        toast(state.eventHost.toaster.message, state.eventHost.toaster.toast);
        return dispatch({ type: InternalAppAction.ACK_TOAST });
      case AppEvent.SYN_SWITCHED_LANG:
        i18n.changeLanguage(state.language);
        return dispatch({ type: InternalAppAction.ACK_SWITCHED_LANG });
      case AppEvent.SYN_REQUESTED_NAVIGATION:
        navigate(state.eventHost.path, state.eventHost.opts);
        return dispatch({ type: InternalAppAction.ACK_REQUESTED_NAVIGATION });
      case AppEvent.LISTENING:
      default:
        return;
    }
  }, [i18n, state.eventHost, state.language, logEvents, navigate]);

  useEffect(() => {
    listenEventBus();
  }, [listenEventBus]);

  useEffect(() => {
    localStorage.setItem("appState", JSON.stringify(state));
  }, [state]);

  const appContext = {
    state,
    dispatch,
  };

  return (
    <ThemeProvider theme={availableThemes[state.theme]}>
      <AppContext.Provider value={appContext}>
        <Outlet />
        <Overlay state={state.overlayState as OverlayState} />
        <BackTop textColor={theme.text} backgroundColor={theme.background} />
        <Toaster theme={state.theme === Themes.LIGHT ? "light" : "dark"} />
        <GlobalStyle />
      </AppContext.Provider>
    </ThemeProvider>
  );
};

export default App;
