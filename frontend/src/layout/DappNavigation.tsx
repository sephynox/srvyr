import React, { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import styled from "styled-components";

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

const DappNavigation: React.FunctionComponent<Props> = ({ navState }): JSX.Element => {
  const appContext = useContext(AppContext);

  return (
    <NavStyle navState={navState}>
      <Logo mode={appContext.theme} />
      <WalletConnect />
      <ul></ul>
      <Row>
        <Col>
          <LanguageSelector language={appContext.language} setLanguage={appContext.setLanguage} />
        </Col>
        <Col>
          <ToggleTheme theme={appContext.theme} setTheme={appContext.setTheme} />
        </Col>
        <Col></Col>
      </Row>
    </NavStyle>
  );
};

export default DappNavigation;

export const NavStyle = styled.nav`
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
