import React, { useContext } from "react";
import { NavLink } from "react-router-dom";
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { AppContext } from "../App";
import { ThemeEngine } from "../styles/GlobalStyle";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";
import { NavBlock } from "./Navigation";
import WalletConnect from "./WalletConnect";
import ToggleTheme from "./ToggleTheme";
import { NavState } from "./NavToggle";

type Props = {
  links: NavBlock[];
  navState: NavState;
};

const DappNavigation: React.FunctionComponent<Props> = ({ links, navState }): JSX.Element => {
  const appContext = useContext(AppContext);

  const buildLink = (link: NavBlock): JSX.Element => {
    return (
      <li>
        {" "}
        <NavLinkStyle onClick={() => appContext.toggleNav(NavState.CLOSED, true)} to={link.to}>
          <FontAwesomeIcon size="lg" icon={link.icon} /> <div>{link.text}</div>
        </NavLinkStyle>
      </li>
    );
  };

  return (
    <NavStyle navState={navState}>
      <Logo mode={appContext.theme} />
      <WalletConnect />
      <hr />
      <NavLinksStyle>{links.map((link) => buildLink(link))}</NavLinksStyle>
      <Row>
        <Col>
          <LanguageSelector language={appContext.language} setLanguage={appContext.setLanguage} />
        </Col>
        <Col>
          <ToggleTheme theme={appContext.theme} setTheme={appContext.setTheme} />
        </Col>
        <Col>
          <em>v{process.env.REACT_APP_BUILD_VERSION}</em>
        </Col>
      </Row>
    </NavStyle>
  );
};

export default DappNavigation;

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

  & #logo {
    width: 90px;
    padding-bottom: 20px;
  }

  & ul {
    flex-grow: 1;
  }

  @media screen and (max-width: 992px) {
    left: ${(props: Props) =>
      props.navState === NavState.OPEN ? 0 : "calc(var(--srvyr-header-width) - (var(--srvyr-header-width) * 2))"};
  }
`;
