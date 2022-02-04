import { IconDefinition } from "@fortawesome/fontawesome-svg-core";
import React, { Component, useContext } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { AppAction, AppContext } from "../App";

export type Crumb = {
  text: string;
  path: string;
  active?: boolean;
  class?: string;
};

export type NavigationProps = {
  navLinks: Array<NavBlock>;
};

export type BreadcrumbsProps = {
  links: Array<Crumb>;
};

export type NavBlock = {
  text: string;
  icon: IconDefinition;
  to: string;
  component: () => JSX.Element | Component;
  keyId?: number;
  className?: string;
  activeClassName?: string;
  exact?: boolean;
};

export const NavItem = ({ keyId, text, icon, to, className = "nav-link" }: NavBlock): JSX.Element => {
  const { t } = useTranslation();
  const appContext = useContext(AppContext);

  return (
    <NavLink onClick={() => appContext.dispatch({ type: AppAction.CLOSE_NAV })} className={className} to={to}>
      <i className={"nav-link" + icon}></i> <span>{t(text, text)}</span>
    </NavLink>
  );
};
