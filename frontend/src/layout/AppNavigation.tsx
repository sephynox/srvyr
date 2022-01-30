import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { Breadcrumb } from "react-bootstrap";

import { BreadcrumbsProps, Crumb, NavBlock, NavigationProps, NavItem } from "./Navigation";

export const Breadcrumbs = ({ links }: BreadcrumbsProps): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Breadcrumb>
      <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
        {t("home")}
      </Breadcrumb.Item>
      {links.map((crumb: Crumb, i: number) => (
        <Breadcrumb.Item
          key={i}
          className={crumb.class}
          linkAs={Link}
          linkProps={{ to: crumb.path }}
          active={crumb.active}
        >
          {crumb.text}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

const AppNavigation: React.FunctionComponent<NavigationProps> = ({ navLinks }: NavigationProps): JSX.Element => {
  return (
    <NavStyle id="navbar">
      <ul>
        {navLinks.map(
          (l: NavBlock, i): JSX.Element => (
            <li key={i}>
              <NavItem {...l} />
            </li>
          )
        )}
      </ul>
    </NavStyle>
  );
};

export default AppNavigation;

export const NavStyle = styled.nav`
  padding: 0;
  display: block;
  overflow: hidden;

  * {
    margin: 0;
    padding: 0;
    list-style: none;
  }

  & ul {
    list-style: none;
  }

  & hr {
    width: 56px;
  }

  & .nav-menu-buttons {
    z-index: 1061;
  }

  & .nav-menu-buttons button {
    border: none;
  }

  & > ul > li {
    position: relative;
    white-space: nowrap;
  }

  & a,
  .nav-menu-buttons button,
  .nav-menu-buttons button:focus,
  a:focus {
    display: flex;
    align-items: center;
    padding: 10px 18px;
    margin-bottom: 8px;
    font-size: 15px;
    border-radius: 50px;
    height: 56px;
    width: 100%;
    overflow: hidden;
    transition: 0.3s;
  }

  & a i,
  a:focus i,
  .nav-menu-buttons button i {
    font-size: 20px;
  }

  & a span,
  a:focus span {
    padding: 0 5px 0 7px;
  }

  & a:hover,
  .active,
  .active:focus,
  li:hover > a {
    background-color: #0563bb;
  }

  & a:hover,
  li:hover > button,
  li:hover > a,
  .nav-menu-buttons button:hover {
    width: 100%;
  }

  & a:hover span,
  li:hover > button span,
  li:hover > a span,
  .nav-menu-buttons button:hover span {
    display: block;
  }

  @media (min-width: 993px) {
    & a,
    a:focus,
    .nav-menu-buttons button {
      width: 56px;
    }

    & a span,
    a:focus span,
    a:focus span,
    .nav-menu-buttons button span,
    .nav-menu-buttons button:focus span {
      display: none;
    }
  }

  @media screen and (max-width: 992px) {
    & hr {
      width: 100%;
    }
  }
`;
