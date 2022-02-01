import React, { useRef, useState } from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClipboard, faClipboardCheck, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { ThemeEngine } from "../styles/GlobalStyle";
import { Overlay, Tooltip } from "react-bootstrap";

type Props = {
  text: string;
  copyText: string;
};

const Copy: React.FunctionComponent<Props> = ({ text, copyText }): JSX.Element => {
  const target = useRef(null);
  const [iconState, setIconState] = useState<IconDefinition>(faClipboard);

  const copy = (text: string) => {
    setIconState(faClipboardCheck);
    navigator.clipboard.writeText(text);
    setTimeout(() => setIconState(faClipboard), 5000);
  };

  return (
    <>
      <ButtonStyle ref={target} onClick={() => copy(text)}>
        <FontAwesomeIcon icon={iconState} />
      </ButtonStyle>
      <Overlay target={target.current} show={iconState === faClipboardCheck} placement="right">
        <Tooltip>{copyText}</Tooltip>
      </Overlay>
    </>
  );
};

export default Copy;

const ButtonStyle = styled.button`
  border: 0;
  border: 0;
  padding: 0;
  outline: none !important;

  color: ${(props: ThemeEngine) => props.theme.textAlt};
  background: none;
  transition: all 0.4s;

  cursor: pointer;

  &:hover {
    color: ${(props: ThemeEngine) => props.theme.text};
  }
`;
