import React from "react";
import { useTranslation } from "react-i18next";
import * as Constants from "../Constants";
import { Section } from "../styles/Section";

const Task = (): JSX.Element => {
  const { t } = useTranslation();

  const title = Constants.SITE_NAME;
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

export default Task;
