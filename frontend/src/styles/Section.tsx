import styled from "styled-components";

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

  @media screen and (max-width: 768px) {
    & h1 {
      text-align: center;
    }

    & h1::before {
      left: calc(50% - 60px);
    }

    & h1::after {
      left: calc(50% - 20px);
    }

    & em {
      text-align: center;
    }
  }
`;
