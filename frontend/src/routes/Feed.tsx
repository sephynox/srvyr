import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";

const Feed = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <Section>
      <header>
        <h1>{t("feed")}</h1>
      </header>
      <FeedStyle>
        <section></section>
        <aside></aside>
      </FeedStyle>
    </Section>
  );
};

export default Feed;

const FeedStyle = styled.div`
  display: flex;
  flex-direction: row;

  & section {
    display: flex;
    flex-direction: column;

    width: 600px;
  }

  & aside {
    flex-grow: 1;
    display: flex;
    flex-direction: column;

    background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};
  }

  @media screen and (max-width: 768px) {
    & aside {
      display: none;
    }
  }
`;
