import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Spinner } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { ThemeEngine } from "../styles/GlobalStyle";
import { AppAction, AppContext } from "../App";
import { DappContext, getBlockieState } from "../Dapp";
import { NSLookupStates } from "../actions/Network";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";
import { NavBlock } from "./Navigation";
import WalletConnect from "./WalletConnect";
import ToggleTheme from "./ToggleTheme";
import { NavState } from "./NavToggle";
import Gastimate from "../components/Gastimate";
import { Blockie } from "../components/Blockies";
import { SkeletonProfile } from "./LoaderSkeleton";

type Props = {
  links: NavBlock[];
  navState: NavState;
};

const DappNavigation: React.FunctionComponent<Props> = ({ links, navState }): JSX.Element => {
  const appContext = useContext(AppContext);
  const dappContext = useContext(DappContext);

  const buildLink = (link: NavBlock, index: number): JSX.Element => {
    return (
      <li key={index}>
        <NavLinkStyle onClick={() => appContext.dispatch({ type: AppAction.CLOSE_NAV })} to={link.to}>
          <FontAwesomeIcon size="lg" icon={link.icon} /> <div>{link.text}</div>
        </NavLinkStyle>
      </li>
    );
  };

  const getNavState = (): JSX.Element => {
    switch (dappContext.state.activeAddress.type) {
      case NSLookupStates.EMPTY:
        return (
          <>
            <ul></ul>
            <WalletConnect />
            <ul></ul>
          </>
        );
      case NSLookupStates.ERROR:
        return <Spinner animation="border" />;
      case NSLookupStates.NO_RESOLVE:
      case NSLookupStates.SUCCESS:
        return (
          <>
            <WalletConnect />
            <hr />
            <NavLinksStyle>{links.map((link, i) => buildLink(link, i))}</NavLinksStyle>
            <GastimateCenterStyle>
              <Gastimate provider={dappContext.ethersProvider} />
            </GastimateCenterStyle>
            <hr />
          </>
        );
      case NSLookupStates.FETCHING:
        return <Spinner animation="border" />;
    }
  };

  const getMobileHeaderBlockie = (): JSX.Element | undefined => {
    const primary = dappContext.state.activeAddress;
    return (
      primary &&
      primary.data && (
        <HeaderBlockStyle size={24}>
          <Blockie
            skeleton={<SkeletonProfile />}
            state={getBlockieState(primary.type)}
            address={primary.data?.address ?? ""}
          />
        </HeaderBlockStyle>
      )
    );
  };

  return (
    <>
      <NavStyle navState={navState}>
        <section>
          <Logo mode={appContext.state.theme} />
          <ToggleTheme
            theme={appContext.state.theme}
            setTheme={(theme) => appContext.dispatch({ type: AppAction.SET_THEME, theme })}
          />
        </section>
        {getNavState()}
        <section>
          <LanguageSelector
            language={appContext.state.language}
            setLanguage={(language) => appContext.dispatch({ type: AppAction.SET_LANGUAGE, language })}
          />
          <em>v{process.env.REACT_APP_BUILD_VERSION}</em>
        </section>
      </NavStyle>
      {getMobileHeaderBlockie()}
    </>
  );
};

export default DappNavigation;

const HeaderBlockStyle = styled.span`
  display: none;
  z-index: 998;

  & img {
    width: 32px;
    height: 32px;
    border-radius: 10%;
  }

  @media screen and (max-width: 992px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    padding-left: 14px;
    padding-top: 14px;
  }
`;

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
