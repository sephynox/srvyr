import React from "react";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

import * as Constants from "../Constants";
import { Section } from "../styles/Section";

const Main: React.FunctionComponent = (): JSX.Element => {
  const { t } = useTranslation();

  const title = "Application Home";
  const subtext = t("content.home");

  return (
    <>
      <Helmet>
        <meta property="og:title" content={Constants.SITE_NAME} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:description" content={t("content.description")} />
      </Helmet>
      <Section>
        <h1>{title}</h1>
        <header>
          <em>{subtext}</em>
        </header>
      </Section>
    </>
  );
};

export default Main;
