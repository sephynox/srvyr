import React from "react";
import styled from "styled-components";
import { useTranslation } from "react-i18next";

import * as Constants from "../Constants";
import { ThemeEngine } from "../styles/GlobalStyle";

const Footer: React.FunctionComponent = (): JSX.Element => {
  const { t } = useTranslation();

  return (
    <FooterStyle id="footer">
      {t("copyright")}{" "}
      <strong>
        <a href={Constants.SITE_REPOSITORY} target="_blank" rel="noreferrer">
          {Constants.SITE_NAME}
        </a>
      </strong>
      .
    </FooterStyle>
  );
};

export default Footer;

const FooterStyle = styled.footer`
  width: 100%;
  height: var(--srvyr-footer-height);
  padding: 20px;

  font-size: 14px;

  text-align: right;
  flex-wrap: wrap;
  align-self: flex-end;

  border-top: 1px solid;
  border-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  color: ${(props: ThemeEngine) => props.theme.text};
  background-color: ${(props: ThemeEngine) => props.theme.backgroundMenu};
`;
