import React, { useCallback, useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Accordion } from "react-bootstrap";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";
import { DappContext, getBlockieState } from "../Dapp";
import { initialNSLookupState, NSLookupState } from "../actions/Network";
import Assets from "../components/Assets";
import { Blockie } from "../components/Blockies";
import Copy from "../components/Copy";
import { shortDisplayAddress } from "../utils/data-helpers";

//import { BalanceCheckerContext } from "./../hardhat/SymfoniContext";

const Overview = (): JSX.Element => {
  const dappContext = useContext(DappContext);
  //const balanceChecker = useContext(BalanceCheckerContext);
  const { t } = useTranslation();
  const props = useParams();
  const navigate = useNavigate();

  const [addressState, setAddressState] = useState<NSLookupState>(initialNSLookupState);

  const checkProps = useCallback(() => {
    if (!props.account) {
      if (dappContext.state.activeAddress && dappContext.state.activeAddress.data) {
        navigate(`${dappContext.state.activeAddress.data.address}`, { replace: true });
      }
    } else {
      dappContext.resolveAddress(props.account)(setAddressState);
    }
  }, [props.account, dappContext, navigate]);

  // const checkEtherBalances = useCallback(() => {
  //   if (balanceChecker.instance && addressState.data && addressState.data.address) {
  //     balanceChecker.instance.tokenBalances([addressState.data.address]);
  //   }
  // }, [addressState, balanceChecker]);

  // const checkBalances = useCallback(() => {
  //   // if ether address
  //   checkEtherBalances();
  //   // checkCardanoBalances(); etc.
  // }, [checkEtherBalances]);

  useEffect(() => {
    checkProps();
    //checkBalances();
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
              <BlockieStyle size={100}>
                <Blockie state={getBlockieState(addressState.type)} address={addressState.data?.address ?? ""} />
              </BlockieStyle>{" "}
              <figcaption>
                <h2>
                  <address>
                    {addressState.data?.ns ? addressState.data.ns : shortDisplayAddress(addressState.data?.address)}
                  </address>
                </h2>
                <h3>
                  {shortDisplayAddress(addressState.data?.address)}{" "}
                  <Copy copyText={t("copied")} text={addressState.data?.address ?? ""} />
                </h3>
                <em>Active Since: TODO</em>
              </figcaption>
            </figure>
          </SummaryStyle>
        </header>
      </Section>
      <Section>
        <Accordion defaultActiveKey="0" flush>
          <Accordion.Item eventKey="0">
            <Accordion.Header>
              <h2>{t("portfolio")}</h2>
            </Accordion.Header>
            <Accordion.Body>
              <Assets data={[]} />
            </Accordion.Body>
          </Accordion.Item>
          <Accordion.Item eventKey="1">
            <Accordion.Header>
              <h2>{t("transactions")}</h2>
            </Accordion.Header>
            <Accordion.Body></Accordion.Body>
          </Accordion.Item>
        </Accordion>
      </Section>
    </>
  );
};

export default Overview;

const BlockieStyle = styled.span`
  & img {
    width: ${(props: { size: number }) => (props.size ? `${props.size}px` : "100%")} !important;
    height: ${(props: { size: number }) => (props.size ? `${props.size}px` : "100%")} !important;
    border-radius: 10%;
  }
`;

const SummaryStyle = styled.article`
  & figure {
    display: flex;
    flex-direction: row;
  }

  & figure figcaption {
    padding-left: 15px;
    overflow: hidden;
    text-overflow: ellipsis;

    & h2 {
      margin-bottom: 0.2em;

      & address {
        padding: 0;
        margin: 0;
      }
    }

    & h3 {
      margin-bottom: 1rem;
      color: ${(props: ThemeEngine) => props.theme.textAlt};
    }

    & em {
      color: ${(props: ThemeEngine) => props.theme.textSubdued};
    }

    & h3 button {
      margin-left: 10px;
    }
  }

  @media screen and (max-width: 992px) {
    & figure {
      justify-content: center;
    }
  }
`;
