import React from "react";
import styled from "styled-components";

const DEFAULT_WIDTH = 992;

type Props = {
  navState: NavState;
  setNavState: (state: NavState) => void;
  color?: string;
  showWidth?: number;
};

export enum NavState {
  OPEN,
  CLOSED,
}

const NavToggle: React.FunctionComponent<Props> = ({
  navState,
  setNavState,
  children,
  color = "#000",
  showWidth = DEFAULT_WIDTH,
}): JSX.Element => {
  return (
    <NavToggleStyle
      type="button"
      color={color}
      showWidth={showWidth}
      onClick={() => setNavState(navState === NavState.CLOSED ? NavState.OPEN : NavState.CLOSED)}
    >
      {children}
    </NavToggleStyle>
  );
};

export default NavToggle;

const NavToggleStyle = styled.button`
  position: fixed;
  right: 20px;
  top: 10px;
  z-index: 1000;

  border: 0;
  border-radius: 50px;
  padding: 5px;
  line-height: 0;

  color: ${(props: Props) => props.color};
  background: none;
  font-size: 28px;
  transition: all 0.4s;
  outline: none !important;

  cursor: pointer;

  @media (min-width: ${(props: Props) => props.showWidth ?? DEFAULT_WIDTH + 1}px) {
    display: none;
  }

  @media screen and (max-width: ${(props: Props) => props.showWidth ?? DEFAULT_WIDTH}px) {
  }
`;
