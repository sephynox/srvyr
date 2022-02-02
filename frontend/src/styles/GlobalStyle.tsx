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

  --bs-blue: #0d6efd;
  --bs-indigo: #6610f2;
  --bs-purple: #6f42c1;
  --bs-pink: #d63384;
  --bs-red: #dc3545;
  --bs-orange: #fd7e14;
  --bs-yellow: #ffc107;
  --bs-green: #198754;
  --bs-teal: #20c997;
  --bs-cyan: #0dcaf0;
  --bs-white: #fff;
  --bs-gray: #6c757d;
  --bs-gray-dark: #343a40;
  --bs-gray-100: #f8f9fa;
  --bs-gray-200: #e9ecef;
  --bs-gray-300: #dee2e6;
  --bs-gray-400: #ced4da;
  --bs-gray-500: #adb5bd;
  --bs-gray-600: #6c757d;
  --bs-gray-700: #495057;
  --bs-gray-800: #343a40;
  --bs-gray-900: #212529;
  --bs-primary: #0d6efd;
  --bs-secondary: #6c757d;
  --bs-success: #198754;
  --bs-info: #0dcaf0;
  --bs-warning: #ffc107;
  --bs-danger: #dc3545;
  --bs-light: #f8f9fa;
  --bs-dark: #212529;
  --bs-primary-rgb: 13, 110, 253;
  --bs-secondary-rgb: 108, 117, 125;
  --bs-success-rgb: 25, 135, 84;
  --bs-info-rgb: 13, 202, 240;
  --bs-warning-rgb: 255, 193, 7;
  --bs-danger-rgb: 220, 53, 69;
  --bs-light-rgb: 248, 249, 250;
  --bs-dark-rgb: 33, 37, 41;
  --bs-white-rgb: 255, 255, 255;
  --bs-black-rgb: 0, 0, 0;
  --bs-body-color-rgb: 33, 37, 41;
  --bs-body-bg-rgb: 255, 255, 255;
  --bs-font-sans-serif: system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", "Liberation Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
  --bs-font-monospace: SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  --bs-gradient: linear-gradient(180deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0));
  --bs-body-font-family: var(--bs-font-sans-serif);
  --bs-body-font-size: 1rem;
  --bs-body-font-weight: 400;
  --bs-body-line-height: 1.5;
  --bs-body-color: #212529;
  --bs-body-bg: #fff;

  --toastify-color-light: ${(props: ThemeEngine) => props.theme.backgroundMenu};
  --toastify-color-dark: ${(props: ThemeEngine) => props.theme.backgroundMenu};
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
  --toastify-toast-background: ${(props: ThemeEngine) => props.theme.backgroundMenu};
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

.table {
  --bs-table-bg: transparent;
  --bs-table-accent-bg: transparent;
  --bs-table-striped-color: #212529;
  --bs-table-striped-bg: rgba(0, 0, 0, 0.05);
  --bs-table-active-color: #212529;
  --bs-table-active-bg: rgba(0, 0, 0, 0.1);
  --bs-table-hover-color: #212529;
  --bs-table-hover-bg: rgba(0, 0, 0, 0.075);
  color: ${(props: ThemeEngine) => props.theme.text};
  border-color: ${(props: ThemeEngine) => props.theme.backgroundDelta};
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

h1 {
  font-size: 1.5em;
}

h2 {
  font-size: 1.3em;
}

h3 {
  font-size: 1.2em;
}

h4 {
  font-size: 1em;
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

.accordion, .accordion-item, .accordion-header {
  color: ${(props: ThemeEngine) => props.theme.text};
  background-color: ${(props: ThemeEngine) => props.theme.background};
}

.accordion-header {
  & h1, h2, h3, h4, h5, h6 {
    margin: 0;
  }
}

.accordion-button:not(.collapsed) {
  color: ${(props: ThemeEngine) => props.theme.text};
  background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};
}

.accordion-button.collapsed {
  color: ${(props: ThemeEngine) => props.theme.textAlt};
  background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};
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

.Toastify__toast-container--bottom-right {
   bottom: 4em;
}
`;
