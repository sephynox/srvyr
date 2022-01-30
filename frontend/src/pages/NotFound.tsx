import React from "react";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { Section } from "../styles/Section";
import NotFoundImage from "../resources/images/not-found.png";

const NotFound = (): JSX.Element => {
  const { t } = useTranslation();

  const title = t("error.404");
  const subtext = t("error.page_not_found");

  return (
    <NotFoundStyle>
      <h2>{title}</h2>
      <header>
        <em>{subtext}</em>
      </header>
      <article>
        <img src={NotFoundImage} alt="404 Abduction Not Found" />
      </article>
    </NotFoundStyle>
  );
};

export default NotFound;

const NotFoundStyle = styled(Section)`
  & article img {
    margin-top: 20px;
    max-width: 100%;
  }
`;
