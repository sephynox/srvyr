import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";
import { DappContext } from "../Dapp";
import { EnsLookupState, initialEnsLookupState } from "../actions/Ethereum";
import { getBlockieState } from "../layout/WalletConnect";
import Assets from "../components/Assets";
import { Blockie } from "../components/Blockies";
import { shortDisplayAddress } from "../utils/data-helpers";
import Copy from "../components/Copy";

const Overview = (): JSX.Element => {
  const dappContext = useContext(DappContext);
  const { t } = useTranslation();
  const props = useParams();
  const navigate = useNavigate();

  const [addressState, setAddressState] = useState<EnsLookupState>(initialEnsLookupState);

  const checkProps = useCallback(() => {
    if (!props.account) {
      if (!!dappContext.activeAddress && !!dappContext.activeAddress.data) {
        navigate(`${dappContext.activeAddress.data.address}`, { replace: true });
      }
    } else {
      dappContext.resolveAddress(props.account)(setAddressState);
    }
  }, [props.account, dappContext, navigate]);

  useEffect(() => {
    checkProps();
  }, [checkProps]);

  return (
    <>
      <Section>
        <Helmet>
          <title>{`${t("overview")}: ${shortDisplayAddress(props.account)}`}</title>
          <meta name="author" content={props.account} />
          <meta property="og:type" content="profile" />
          <meta property="profile:username" content={props.account}></meta>
        </Helmet>
        <header>
          <h1>{t("overview")}</h1>
          <SummaryStyle>
            <figure>
              <BlockieStyle
                state={getBlockieState(addressState.type)}
                address={addressState.data?.address ?? ""}
                size={100}
              />{" "}
              <figcaption>
                <h2>
                  <address>
                    {addressState.data?.ens ? addressState.data.ens : shortDisplayAddress(addressState.data?.address)}
                  </address>
                </h2>
                <h3>
                  {shortDisplayAddress(addressState.data?.address)}{" "}
                  <Copy copyText={t("copied")} text={addressState.data?.address ?? ""} />
                </h3>
              </figcaption>
            </figure>
          </SummaryStyle>
        </header>
      </Section>
      <Section>
        <Assets data={[]} />
      </Section>
    </>
  );
};

export default Overview;

const BlockieStyle = styled(Blockie)`
  top: 0;
  left: 0;
  display: inline;
`;

const SummaryStyle = styled.article`
  & figure {
    display: flex;
    flex-direction: row;
  }

  & figure figcaption {
    padding-left: 10px;
    overflow: hidden;
    text-overflow: ellipsis;

    & h2 {
      font-size: 1.4em;
    }

    & h2 address {
      padding: 0;
      margin: 0;
    }

    & h3 {
      font-size: 1em;
      color: ${(props: ThemeEngine) => props.theme.textAlt};
    }

    & h3 button {
      margin-left: 10px;
    }
  }
`;
