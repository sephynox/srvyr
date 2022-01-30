import React, { Component, useContext } from "react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";
import styled from "styled-components";

import { AppContext } from "../App";

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

export enum NavState {
  OPEN = "active",
  CLOSED = "",
}

export type NavBlock = {
  text: string;
  icon: string;
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
    <NavLink onClick={() => appContext.toggleNav(NavState.CLOSED, true)} className={className} to={to}>
      <i className={"nav-link" + icon}></i> <span>{t(text, text)}</span>
    </NavLink>
  );
};

export const NavToggle = (): JSX.Element => {
  const appContext = useContext(AppContext);

  return (
    <NavToggleStyle
      type="button"
      onClick={() => {
        appContext.toggleNav(undefined, true);
      }}
      className={appContext.navState === NavState.CLOSED ? "bi bi-list mobile-nav-toggle" : `bi bi-x mobile-nav-toggle`}
    ></NavToggleStyle>
  );
};

const NavToggleStyle = styled.button`
  position: fixed;
  right: 20px;
  top: 10px;
  z-index: 1000;
  border: 0;
  background: none;
  font-size: 28px;
  transition: all 0.4s;
  outline: none !important;
  line-height: 0;
  cursor: pointer;
  border-radius: 50px;
  padding: 5px;
`;
