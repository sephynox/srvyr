import { createGlobalStyle } from "styled-components";
import "react-toastify/dist/ReactToastify.css";
import Theme from "../tools/Themes";

// Hack
export type ThemeEngine = {
  theme: Theme;
};

export const GlobalStyle = createGlobalStyle`
$font-size-base: 1rem;

::-webkit-scrollbar {
    background-color: ${(props: ThemeEngine) => props.theme.background};
}

::-webkit-scrollbar-track {
    background-color: ${(props: ThemeEngine) => props.theme.background};
}

::-webkit-scrollbar-thumb {
    background-color: ${(props: ThemeEngine) => props.theme.background};
    outline: 1px solid ${(props: ThemeEngine) => props.theme.backgroundDelta};
}

:root {
  --srvyr-header-width: 300px;
  --srvyr-footer-height: 60px;

  --secondary: rgb(229 229 229);

  --toastify-color-light: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  --toastify-color-dark: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  --toastify-color-info: ${(props: ThemeEngine) => props.theme.text};
  --toastify-color-success: ${(props: ThemeEngine) => props.theme.text};
  --toastify-color-warning: ${(props: ThemeEngine) => props.theme.text};
  --toastify-color-error: ${(props: ThemeEngine) => props.theme.text};
  --toastify-color-transparent: ${(props: ThemeEngine) => props.theme.backgroundDelta};

  --toastify-icon-color-info: ${(props: ThemeEngine) => props.theme.infoText};
  --toastify-icon-color-success: ${(props: ThemeEngine) => props.theme.successText};
  --toastify-icon-color-warning: ${(props: ThemeEngine) => props.theme.warnText};
  --toastify-icon-color-error: ${(props: ThemeEngine) => props.theme.dangerText};

  --toastify-toast-width: 320px;
  --toastify-toast-background: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  --toastify-toast-min-height: 64px;
  --toastify-toast-max-height: 800px;
  --toastify-font-family: sans-serif;
  --toastify-z-index: 9999;

  --toastify-text-color-light: ${(props: ThemeEngine) => props.theme.text};
  --toastify-text-color-dark: ${(props: ThemeEngine) => props.theme.text};

  --toastify-spinner-color: #616161;
  --toastify-spinner-color-empty-area: #e0e0e0;

  --toastify-color-progress-light: linear-gradient(
    to right,
    #4cd964,
    #5ac8fa,
    #007aff,
    #34aadc,
    #5856d6,
    #ff2d55
  );

  --toastify-color-progress-dark: #bb86fc;
  --toastify-color-progress-info: var(--toastify-color-info);
  --toastify-color-progress-success: var(--toastify-color-success);
  --toastify-color-progress-warning: var(--toastify-color-warning);
  --toastify-color-progress-error: var(--toastify-color-error);
}

html,
body {
    height: 100vh;
    margin: 0;
    padding: 0;
    overflow-y: auto;
    flex-direction: column; 
    background-color: ${(props: ThemeEngine) => props.theme.background};
    color: ${(props: ThemeEngine) => props.theme.text};
    transition: all 0.25s linear;
    font-size: 1em;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen",
        "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue",
        sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

#root {
  height: 100%;
  display: flex;
  flex-wrap: wrap;
}

a {
    color: ${(props: ThemeEngine) => props.theme.link};
    text-decoration: none;
}

a:hover {
    color: ${(props: ThemeEngine) => props.theme.linkHover};
    text-decoration: none;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, "Courier New",
    monospace;
}

.dropdown-menu {
  background-color: ${(props: ThemeEngine) => props.theme.backgroundDelta};
}

.dropdown-item, .dropdown-item-text {
  color: ${(props: ThemeEngine) => props.theme.text};
}

.btn-secondary {
  color: ${(props: ThemeEngine) => props.theme.text};
  border-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  background-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
}
`;
