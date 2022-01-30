import React from "react";
import { useTranslation } from "react-i18next";
import { Section } from "../../styles/Section";

const App = (): JSX.Element => {
  const { t } = useTranslation();

  const title = "Tasker";
  const subtext = t("content.home");

  return (
    <>
      <Section>
        <h1>{title}</h1>
        <header>
          <em>{subtext}</em>
        </header>
      </Section>
    </>
  );
};

export default App;
