import * as React from "react";
import styled from "styled-components";
import Routes from "../Routes";
import Theme from "../tools/Themes";

const Body: React.FunctionComponent = (): JSX.Element => (
  <MainStyle id="main" className="d-flex flex-column">
    <div className="margin-auto-vertical">
      <Routes />
    </div>
  </MainStyle>
);

export default Body;

const MainStyle = styled.main<Theme>`
  width: 100%;
  min-height: 100vh;
  background-size: cover;
  position: relative;
  padding: 60px 0 80px 15px;

  @media (min-width: 993px) {
    padding-left: 160px;
    padding-right: 30px;
  }

  @media screen and (max-width: 992px) {
    padding: 20px 15px 80px 15px;
  }

  @media screen and (max-height: 800px) {
    margin-bottom: 50px;
  }
`;
