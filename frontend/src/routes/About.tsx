import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import styled, { useTheme } from "styled-components";

import * as Constants from "../Constants";
import { AppContext } from "../App";
import Logo from "../layout/Logo";
import { Section } from "../styles/Section";
import Quote from "../components/Quote";
import Theme from "../styles/Themes";

const Overview = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const { t } = useTranslation();
  const theme: Theme = useTheme();

  return (
    <>
      <Helmet>
        <title>{`${t("about")}: ${Constants.SITE_NAME}`}</title>
        <meta name="author" content={Constants.SITE_NAME} />
        <meta name="description" content={t("content.description")} />
        <meta property="og:title" content={Constants.SITE_NAME} />
        <meta property="og:site_name" content={Constants.SITE_NAME}></meta>
        <meta property="og:type" content="website" />
        <meta property="og:url" content={window.location.href} />
        {/* <meta property="og:image" content={OpenGraphImage} /> */}
        <meta property="og:image:type" content="image/png" />
        <meta property="og:description" content={t("content.description")} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content={Constants.SITE_DOMAIN} />
        <meta property="twitter:url" content={window.location.href} />
        <meta name="twitter:title" content={Constants.SITE_NAME} />
        <meta name="twitter:description" content={t("content.description")} />
        {/* <meta name="twitter:image" content={OpenGraphImage} /> */}
      </Helmet>
      <AboutStyle>
        <Section>
          <header>
            <h1>{t("about")}</h1>
          </header>
          <LogoStyle>
            <Logo mode={appContext.state.theme} />
          </LogoStyle>
          <Quote
            quote={"Something profound"}
            author="Someone profound"
            borderColor={theme.infoText}
            textColor={theme.textAlt}
          />
          <p>
            SRVYR is a lens into the decentralized ecosystem. The application is fully decentralized, does not collect
            personal data, and can be run locally if one wishes.
          </p>
        </Section>
      </AboutStyle>
    </>
  );
};

export default Overview;

const LogoStyle = styled.figure`
  width: 100%;
  text-align: center;
  margin-top: 4em;
  margin-bottom: 4em;
`;

const AboutStyle = styled.article`
  & p {
    max-width: 800px;
  }

  & figure {
    justify-content: center;
  }
  @media screen and (max-width: 992px) {
  }
`;
