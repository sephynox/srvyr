import React, { useContext } from "react";
import styled from "styled-components";
import { ThemeEngine } from "../styles/GlobalStyle";
import { AppContext } from "../App";
import LanguageSelector from "./LanguageSelector";
import Logo from "./Logo";
import { NavigationProps } from "./Navigation";
import WalletConnect from "./WalletConnect";
import ToggleTheme from "./ToggleTheme";
import { Col, Row } from "react-bootstrap";

const DappNavigation: React.FunctionComponent<NavigationProps> = (): JSX.Element => {
  const appContext = useContext(AppContext);

  return (
    <NavStyle>
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
    padding: 0 0 0 15px;
    left: calc(var(--srvyr-header-width) - (var(--srvyr-header-width) * 2));
  }
`;
