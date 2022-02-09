import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";

type Props = {
  text: string;
  charactersMax: number;
  copy?: boolean;
};

enum ReadMoreState {
  SHOW = "show",
  HIDE = "hide",
}

enum CopyState {
  COPY = "bi-clipboard",
  COPIED = "bi-clipboard-check",
}

const ReadMore: React.FunctionComponent<Props> = ({ text, charactersMax, copy }: Props): JSX.Element => {
  const { t } = useTranslation();
  const [readMoreState, setReadMoreState] = useState(() => ReadMoreState.HIDE);
  const [copyState, setCopyState] = useState(() => CopyState.COPY);

  const textShort = text.substring(0, charactersMax);
  const textExtra = text.substring(charactersMax, text.length);
  const showButton = text.length <= charactersMax ? "hide" : "";

  const toggleShowMore = () => {
    setReadMoreState(readMoreState === ReadMoreState.SHOW ? ReadMoreState.HIDE : ReadMoreState.SHOW);
  };

  const copyText = (text: string) => {
    setCopyState(CopyState.COPIED);
    navigator.clipboard.writeText(text);
  };

  return (
    <ReadMoreStyles>
      {textShort}
      <span className={"read-more-target " + readMoreState}>{textExtra}</span>
      <button onClick={toggleShowMore} className={"read-more-button " + showButton}>
        ...
      </button>
      {copy ? (
        <button title={t("copy")} onClick={() => copyText(text)} className="read-more-button">
          <i className={copyState}></i>
        </button>
      ) : null}
    </ReadMoreStyles>
  );
};

export default ReadMore;

const ReadMoreStyles = styled.p`
  & .read-more-target {
    transition: 0.1s ease;
  }

  & .read-more-target.hide {
    opacity: 0;
    max-height: 0;
    font-size: 0;
  }

  & .read-more-target.show {
    opacity: 1;
    max-height: auto;
  }

  & .read-more-button.hide {
    display: none;
  }

  & .read-more-button {
    cursor: pointer;
    display: inline-block;
    padding: 0 0.5em;
    color: ${(props: ThemeEngine) => props.theme.text};
    border: 1px solid ${(props: ThemeEngine) => props.theme.backgroundDelta};
    background-color: ${(props: ThemeEngine) => props.theme.backgroundIcon};
    border-radius: 0.25em;
  }
`;
