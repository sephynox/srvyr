import React from "react";
import { useEffect } from "react";
import { useState } from "react";
import styled from "styled-components";
import { ThemeEngine } from "../styles/GlobalStyle";
import Theme from "../tools/Themes";

type Props = {
  size: number;
  margin: number;
  fontSize: number;
  changeHandler: (state: SwitchStates) => void;
  disabled?: boolean;
  active?: SwitchStates;
  className?: string;
};

export enum SwitchStates {
  INACTIVE,
  ACTIVE,
}

const Switch = (props: Props): JSX.Element => {
  const [active, setActive] = useState(props.active ?? SwitchStates.INACTIVE);

  const toggleActive = () => {
    if (props.disabled) return;
    setActive(active === SwitchStates.ACTIVE ? SwitchStates.INACTIVE : SwitchStates.ACTIVE);
  };

  useEffect(() => {
    props.changeHandler(active);
  }, [props, active]);

  return (
    <SwitchStyle {...props} onClick={toggleActive}>
      <button type="button" className={active === SwitchStates.ACTIVE ? "active" : ""} disabled={props.disabled} />
      <div className="handle"></div>
    </SwitchStyle>
  );
};

export default Switch;

const SwitchStyle = styled.div<Theme>`
  position: relative;
  display: inline-block;

  & button[disabled] {
    cursor: not-allowed;
    background-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary} !important;

    ~ .handle {
      cursor: not-allowed;
    }
  }

  & button {
    cursor: pointer;
    margin: 0 ${(props: Props) => props.margin * 5}rem;
    padding: 0;
    position: relative;
    border: none;
    height: ${(props: Props) => props.size}px;
    width: ${(props: Props) => props.size * 2}px;
    border-radius: ${(props: Props) => props.size}px;
    background-color: ${(props: ThemeEngine) => props.theme.backgroundDelta};

    &:focus,
    &.focus {
      &,
      &.active {
        outline: none;
      }
    }

    &:before,
    &:after {
      line-height: ${(props: Props) => props.size}px;
      width: ${(props: Props) => props.margin}rem;
      text-align: center;
      font-weight: 600;
      font-size: ${(props: Props) => props.fontSize}em;
      text-transform: uppercase;
      letter-spacing: 2px;
      position: absolute;
      bottom: 0;
      transition: opacity 0.25s;
    }

    &:before {
      content: "Off";
      color: ${(props: ThemeEngine) => props.theme.text};
      left: -${(props: Props) => props.margin * 5}rem;
    }

    &:after {
      content: "On";
      color: ${(props: ThemeEngine) => props.theme.text};
      right: -${(props: Props) => props.margin * 2}rem;
      opacity: 0.5;
    }

    ~ .handle {
      cursor: pointer;
      position: absolute;
      margin: auto;
      top: 5px;
      bottom: 0;
      left: ${(props: Props) => props.size + props.size * 0.75}px;
      width: ${(props: Props) => props.size * 0.75}px;
      height: ${(props: Props) => props.size * 0.75}px;
      border-radius: ${(props: Props) => props.size * 0.75}px;
      background: #333;
      transition: left 0.25s;
    }

    &.active {
      background-color: ${(props: ThemeEngine) => props.theme.success};
      transition: background-color 0.25s;

      ~ .handle {
        left: ${(props: Props) => props.size + props.size * 1.75}px;
        transition: left 0.25s;

        @media screen and (max-width: 768px) {
          left: ${(props: Props) => props.size + props.size * 1.65}px;
        }
      }

      &:before {
        opacity: 0.5;
      }

      &:after {
        opacity: 1;
      }
    }

    &.btn-sm {
      &:before,
      &:after {
        line-height: ${(props: Props) => props.size - 2}px;
        color: #fff;
        letter-spacing: 0.75px;
        left: ${(props: Props) => props.size * 0.275}px;
        width: ${(props: Props) => props.size * 1.55}px;
      }

      &:before {
        text-align: right;
      }

      &:after {
        text-align: left;
        opacity: 0;
      }

      &.active {
        &:before {
          opacity: 0;
        }

        &:after {
          opacity: 1;
        }
      }
    }

    &.btn-xs {
      &:before,
      &:after {
        display: none;
      }
    }
  }
`;
