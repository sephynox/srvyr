import LogoDark from "../resources/images/srvyr-dark.png";
import LogoLight from "../resources/images/srvyr-light.png";

export enum Themes {
  LIGHT,
  DARK,
}

export enum Active {
  ON = "active",
  OFF = "",
}

export type Theme = {
  name: number;
  border: string;
  background: string;
  backgroundSecondary: string;
  backgroundSecondaryActive: string;
  backgroundMenu: string;
  backgroundIcon: string;
  backgroundDelta: string;
  link: string;
  linkHover: string;
  hr: string;
  text: string;
  textAlt: string;
  textSubdued: string;
  textIcon: string;
  info: string;
  infoText: string;
  infoBorder: string;
  warn: string;
  warnText: string;
  warnBorder: string;
  danger: string;
  dangerText: string;
  dangerBorder: string;
  success: string;
  successText: string;
  successBorder: string;
  loaderBase: string;
  loaderHightlight: string;
  images: Record<string, string>;
};

export const lightTheme: Theme = {
  name: Themes.LIGHT,
  border: "1px solid rgba(0, 0, 0, .125)",
  background: "rgb(255, 255, 255)",
  backgroundSecondary: "rgb(200 200 200)",
  backgroundSecondaryActive: "rgb(229 229 229)",
  backgroundMenu: "rgb(247 251 255)",
  backgroundIcon: "rgb(255, 255, 255)",
  backgroundDelta: "rgba(0, 0, 0, .1)",
  link: "rgb(6, 125, 237)",
  linkHover: "rgb(6, 125, 237)",
  hr: "rgb(96, 96, 96)",
  text: "#000",
  textAlt: "#1a487d",
  textSubdued: "#a5a5a5",
  textIcon: "#000",
  info: "rgb(6, 125, 237)",
  infoText: "rgb(6, 125, 237)",
  infoBorder: "rgb(6, 125, 237)",
  warn: "rgb(227, 0, 21)",
  warnText: "rgb(227, 0, 21)",
  warnBorder: "rgb(227, 0, 21)",
  danger: "rgba(151, 3, 1, 0.3)",
  dangerText: "#721c24",
  dangerBorder: "rgb(157, 3, 1)",
  success: "rgb(19, 162, 7)",
  successText: "rgb(19, 162, 7)",
  successBorder: "rgb(19, 162, 7)",
  loaderBase: "rgb(229, 229, 229)",
  loaderHightlight: "rgb(201, 201, 201)",
  images: {
    logo: LogoLight,
  },
};

export const darkTheme: Theme = {
  name: Themes.DARK,
  border: "1px solid rgba(169, 155, 134, 0.13)",
  background: "rgb(17, 20, 28)",
  backgroundSecondary: "rgb(36, 36, 36)",
  backgroundSecondaryActive: "rgb(86 94 100)",
  backgroundMenu: "rgb(10 10 10)",
  backgroundIcon: "rgb(87, 87, 87)",
  backgroundDelta: "rgb(86 94 100)",
  link: "rgb(81, 139, 193)",
  linkHover: "rgb(6, 125, 237)",
  hr: "rgb(81, 83, 84)",
  text: "#fff",
  textAlt: "#af947e",
  textSubdued: "#a5a5a5",
  textIcon: "#9fa1a3",
  infoText: "#8a9ed3",
  info: "rgb(6, 125, 237)",
  infoBorder: "rgb(6, 125, 237)",
  warn: "rgba(168, 141, 12, 0.3)",
  warnText: "#f0cf81",
  warnBorder: "rgb(174, 146, 13)",
  danger: "rgba(126, 3, 1, 0.3)",
  dangerText: "#f08181",
  dangerBorder: "rgb(220, 11, 5)",
  success: "rgb(32, 253, 13)",
  successText: "rgb(32, 253, 13)",
  successBorder: "rgb(32, 253, 13)",
  loaderBase: "rgb(32, 32, 32)",
  loaderHightlight: "rgb(68, 68, 68)",
  images: {
    logo: LogoDark,
  },
};

export const availableThemes: Record<string, Theme> = {
  [Themes.LIGHT]: lightTheme,
  [Themes.DARK]: darkTheme,
};

export default Theme;
