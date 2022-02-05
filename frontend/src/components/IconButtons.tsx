import React, { useRef, useState } from "react";
import { Overlay, OverlayTrigger, Tooltip } from "react-bootstrap";
import { Placement } from "react-bootstrap/esm/types";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp } from "@fortawesome/fontawesome-svg-core";
import { faClipboard, faClipboardCheck, IconDefinition } from "@fortawesome/free-solid-svg-icons";

import { ThemeEngine } from "../styles/GlobalStyle";

enum OverlayStates {
  HIDE,
  SHOW,
}

type CopyProps = {
  text: string;
  copyText: string;
  tooltip: string;
  margin?: string;
  tooltipPlacement?: Placement;
};

type ActionProps = {
  icon: IconProp;
  action: () => void;
  tooltip: string;
  tooltipHover?: boolean;
  iconActive?: IconProp;
  margin?: string;
  tooltipPlacement?: Placement;
};

export const Copy: React.FunctionComponent<CopyProps> = ({
  text,
  copyText,
  tooltip,
  margin,
  tooltipPlacement = "right",
}): JSX.Element => {
  const target = useRef(null);
  const [iconState, setIconState] = useState<IconDefinition>(faClipboard);

  const copy = (text: string) => {
    setIconState(faClipboardCheck);
    navigator.clipboard.writeText(text);
    setTimeout(() => setIconState(faClipboard), 5000);
  };

  return (
    <>
      <OverlayTrigger placement={tooltipPlacement} overlay={<Tooltip>{tooltip}</Tooltip>}>
        <ButtonStyle ref={target} margin={margin} onClick={() => copy(text)}>
          <FontAwesomeIcon icon={iconState} />
        </ButtonStyle>
      </OverlayTrigger>
      <Overlay target={target.current} show={iconState === faClipboardCheck} placement={tooltipPlacement}>
        <Tooltip>{copyText}</Tooltip>
      </Overlay>
    </>
  );
};

export const Action: React.FunctionComponent<ActionProps> = ({
  icon,
  action,
  tooltip,
  tooltipHover,
  iconActive,
  margin,
  tooltipPlacement = "right",
}): JSX.Element => {
  const target = useRef(null);

  const [state, setState] = useState(false);
  const [overlayState, setOverlayState] = useState(OverlayStates.HIDE);

  const callback = (action: () => void) => {
    action();
    setState(true);
    return () => setState(false);
  };

  return (
    <>
      <ButtonStyle
        ref={target}
        margin={margin}
        onClick={() => callback(action)}
        onMouseEnter={() => tooltipHover && setOverlayState(OverlayStates.SHOW)}
        onMouseLeave={() => tooltipHover && setOverlayState(OverlayStates.HIDE)}
      >
        <FontAwesomeIcon icon={!state ? icon : iconActive ?? icon} />
      </ButtonStyle>
      <Overlay target={target.current} show={overlayState ? true : false} placement={tooltipPlacement}>
        <Tooltip>{tooltip}</Tooltip>
      </Overlay>
    </>
  );
};

const ButtonStyle = styled.button`
  border: 0;
  padding: 0;
  margin: ${(props: { margin: string | undefined }) => props.margin ?? 0} !important;

  outline: none !important;
  color: ${(props: ThemeEngine) => props.theme.textAlt};
  background: none;
  transition: all 0.4s;

  cursor: pointer;

  &:hover {
    color: ${(props: ThemeEngine) => props.theme.text};
  }
`;
