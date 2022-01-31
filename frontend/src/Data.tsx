import { t } from "i18next";
import { faHome, faArchway } from "@fortawesome/free-solid-svg-icons";

import { NavBlock } from "./layout/Navigation";
import { SocialBlock } from "./components/SocialLinks";

import Home from "./routes/Home";
import Overview from "./routes/Overview";

export const navLinks: Array<NavBlock> = [
  {
    text: t("home"),
    icon: faHome,
    to: "/",
    exact: true,
    component: Home,
  },
];

export const dappNavLinks: Array<NavBlock> = [
  {
    text: t("overview"),
    icon: faArchway,
    to: "overview",
    exact: true,
    component: Overview,
  },
];

export const socialLinks: Array<SocialBlock> = [
  {
    title: "Facebook",
    icon: "icon bi-facebook",
    url: "https://www.facebook.com/sharer/sharer.php?u=",
  },
  {
    title: "Twitter",
    icon: "icon bi-twitter",
    url: "https://twitter.com/intent/tweet?url=",
  },
  {
    title: "LinkedIn",
    icon: "icon bi-linkedin",
    url: "https://www.linkedin.com/shareArticle?mini=true&url=",
  },
  {
    title: "Email",
    icon: "icon bi-envelope-open-fill",
    url: "mailto:info@example.com?subject=",
  },
];

export const systemEvents: Record<string, Record<string, string>> = {
  change_theme: {
    category: "Style",
    action: "Theme",
  },
  disqus_comment: {
    category: "Social",
    action: "Comment",
  },
  manual_refresh: {
    category: "Maintenance",
    action: "Refresh",
  },
};

export const systemLanguages: Record<string, string> = {
  "en-US": "English",
  es: "Español",
  de: "Deutsch",
};

export const supportedLanguages: Array<keyof typeof systemLanguages> = ["en-US", "es", "de"];

export const ethersConfig: Record<string, string> = {
  infura: process.env.REACT_APP_INFURA_PROJECT_ID ?? "",
};
