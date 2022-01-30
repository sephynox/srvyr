import React from "react";
import styled from "styled-components";

export enum OverlayState {
  SHOW = "active",
  HIDE = "",
}

const Overlay = ({ state }: { state: OverlayState }): JSX.Element => {
  return <OverlayStyle id="overlay" className={state as string}></OverlayStyle>;
};

export default Overlay;

const OverlayStyle = styled.div`
  position: fixed;
  display: none;
  width: 100vw;
  height: 100vh;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 2;
  cursor: pointer;

  &.active {
    display: block;
  }
`;
