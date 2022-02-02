import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { useEthers } from "@usedapp/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppContext } from "../App";
import { DappContext } from "../Dapp";

import { ThemeEngine } from "../styles/GlobalStyle";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";
import { NavBlock } from "./Navigation";
import WalletConnect from "./WalletConnect";
import ToggleTheme from "./ToggleTheme";
import { NavState } from "./NavToggle";
import Gastimate from "../components/Gastimate";

type Props = {
  links: NavBlock[];
  navState: NavState;
};

const DappNavigation: React.FunctionComponent<Props> = ({ links, navState }): JSX.Element => {
  const appContext = useContext(AppContext);
  const dappContext = useContext(DappContext);
  const { active } = useEthers();

  const buildLink = (link: NavBlock, index: number): JSX.Element => {
    return (
      <li key={index}>
        <NavLinkStyle onClick={() => appContext.setNavState(NavState.CLOSED)} to={link.to}>
          <FontAwesomeIcon size="lg" icon={link.icon} /> <div>{link.text}</div>
        </NavLinkStyle>
      </li>
    );
  };

  return (
    <NavStyle navState={navState}>
      <section>
        <Logo mode={appContext.theme} />
        <ToggleTheme theme={appContext.theme} setTheme={appContext.setTheme} />
      </section>
      {active && !!dappContext.activeAddress?.data ? (
        <>
          <WalletConnect />
          <hr />
          <NavLinksStyle>{links.map((link, i) => buildLink(link, i))}</NavLinksStyle>
          <GastimateCenterStyle>
            <Gastimate provider={dappContext.ethersProvider} />
          </GastimateCenterStyle>
          <hr />
        </>
      ) : (
        <>
          <ul></ul>
          <WalletConnect />
          <ul></ul>
        </>
      )}
      <section>
        <LanguageSelector language={appContext.language} setLanguage={appContext.setLanguage} />
        <em>v{process.env.REACT_APP_BUILD_VERSION}</em>
      </section>
    </NavStyle>
  );
};

export default DappNavigation;

const GastimateCenterStyle = styled.span`
  text-align: right;
`;

const NavLinkStyle = styled(NavLink)`
  display: flex;
  flex-direction: row;
  align-items: center;

  & div {
    font-size: 18px;
    text-transform: capitalize;

    padding-left: 15px;
  }
`;

const NavLinksStyle = styled.ul`
  padding: 0;
  margin: 10px 0 0 20px;

  list-style-type: none;

  & li > * {
    margin-bottom: 30px;

    color: ${(props: ThemeEngine) => props.theme.text};
  }

  & li:hover > * {
    color: ${(props: ThemeEngine) => props.theme.infoText};
  }
`;

const NavStyle = styled.nav`
  width: var(--srvyr-header-width);
  height: 100vh;

  display: block;
  overflow: hidden;
  position: fixed;

  left: 0;
  padding: 15px;
  display: flex;
  flex-direction: column;

  border-right: 1px solid;
  border-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};

  & section {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }

  & section:first-child {
    padding-bottom: 20px;
  }

  & #logo {
    width: 90px;
  }

  & ul {
    flex-grow: 1;
  }

  @media screen and (max-width: 992px) {
    z-index: 999;
    left: ${(props: Props) =>
      props.navState === NavState.OPEN ? 0 : "calc(var(--srvyr-header-width) - (var(--srvyr-header-width) * 2))"};
  }
`;
