import React from "react";
import { useTranslation } from "react-i18next";

import { Section } from "../styles/Section";

const Discover = (): JSX.Element => {
  const { t } = useTranslation();

  const title = t("discover");

  return (
    <Section>
      <h1>{title}</h1>
      <header></header>
    </Section>
  );
};

export default Discover;
