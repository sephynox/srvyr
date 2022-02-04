import React, { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Accordion } from "react-bootstrap";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";
import { DappContext, getBlockieState } from "../Dapp";
import { AssetPortfolio, initialNSLookupState, Networks, NSLookupState } from "../actions/Network";
import Assets from "../components/Assets";
import { Blockie } from "../components/Blockies";
import Copy from "../components/Copy";
import { shortDisplayAddress } from "../utils/data-helpers";

import { BalanceCheckerContext } from "./../hardhat/SymfoniContext";
import { ethers } from "ethers";

enum OverviewAction {
  SET_ADDRESS = "SET_ADDRESS",
}

type OverviewActions = { type: OverviewAction.SET_ADDRESS; data: NSLookupState };

type OverviewState = {
  addressState: NSLookupState;
  portfolioDataState: AssetPortfolio;
  transactionDataState: Record<string, string>; // TODO
};

const initialOverviewState = {
  addressState: initialNSLookupState,
  portfolioDataState: {},
  transactionDataState: {},
};

const overviewReducer = (state: OverviewState, action: OverviewActions): OverviewState => {
  switch (action.type) {
    case OverviewAction.SET_ADDRESS:
      return { ...state, addressState: action.data };
  }
};

const Overview = (): JSX.Element => {
  const dappContext = useContext(DappContext);
  const balanceChecker = useContext(BalanceCheckerContext);
  const { t } = useTranslation();
  const props = useParams();
  const navigate = useNavigate();

  const isActive = useRef(true);
  const [state, dispatch] = useReducer(overviewReducer, initialOverviewState);

  const setAddressStateAssist = (state: NSLookupState) => {
    if (isActive) {
      dispatch({ type: OverviewAction.SET_ADDRESS, data: state });
    }
  };

  const checkProps = useCallback(() => {
    if (!props.account) {
      if (dappContext.state.activeAddress && dappContext.state.activeAddress.data) {
        navigate(`${dappContext.state.activeAddress.data.address}`, { replace: true });
      }
    } else {
      dappContext.resolveEthereumAddress(props.account)(setAddressStateAssist);
    }
  }, [props.account, dappContext, navigate]);

  const checkEtherBalances = useCallback(async () => {
    const networkContracts = dappContext.state.tokenLookupCache.network[Networks.ETHEREUM];

    if (Object.entries(networkContracts).length > 0) {
      const contractAddresses = networkContracts.map((record) => record.contract);

      if (balanceChecker.instance && state.addressState.data && state.addressState.data.address) {
        try {
          balanceChecker.instance
            .attach("0x99dbe4aea58e518c50a1c04ae9b48c9f6354612f") // FIXME
            .tokenBalances([state.addressState.data.address], contractAddresses)
            .then((balances) => {
              balances.forEach((balance, i) => {
                console.log(i, ethers.utils.formatUnits(balance, 18));
              });
            });
        } catch (e) {
          console.log(e);
        }
      }
    }
  }, [state.addressState.data, dappContext.state.tokenLookupCache.network, balanceChecker.instance]);

  useEffect(() => {
    checkProps();
    // if ether address
    checkEtherBalances();
    // checkCardanoBalances(); etc.

    return () => {
      isActive.current = false;
    };
  }, [checkProps, checkEtherBalances]);

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
                <Blockie
                  state={getBlockieState(state.addressState.type)}
                  address={state.addressState.data?.address ?? ""}
                />
              </BlockieStyle>{" "}
              <figcaption>
                <h2>
                  <address>
                    {state.addressState.data?.ns
                      ? state.addressState.data.ns
                      : shortDisplayAddress(state.addressState.data?.address)}
                  </address>
                </h2>
                <h3>
                  {shortDisplayAddress(state.addressState.data?.address)}{" "}
                  <Copy copyText={t("copied")} text={state.addressState.data?.address ?? ""} />
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
