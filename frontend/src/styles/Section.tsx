import styled from "styled-components";

import { ThemeEngine } from "./GlobalStyle";

export const Section = styled.section`
  width: 100%;
  background-size: cover;
  position: relative;
  padding: 10px 0 10px 0;

  & h1 {
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 20px;
    padding-bottom: 20px;
    position: relative;
  }

  & h1::before {
    content: "";
    position: absolute;
    display: block;
    width: 120px;
    height: 1px;
    background: #ddd;
    bottom: 1px;
  }

  & h1::after {
    content: "";
    position: absolute;
    display: block;
    width: 40px;
    height: 3px;
    background: #0563bb;
    bottom: 0;
    left: 40px;
  }

  @media screen and (max-width: 992px) {
    & h1 {
      top: 0;
      left: 0;
      right: 0;
      z-index: 997;

      padding-top: 15px;
      padding-bottom: 15px;
      margin-bottom: 0;
      border-bottom: 1px solid;

      position: fixed;
      text-align: center;

      background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};
      border-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
    }

    & h1::before {
      height: 0;
    }

    & h1::after {
      height: 0;
    }

    & em {
      text-align: center;
    }
  }
`;
