import React, { useCallback, useContext, useEffect, useReducer } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Accordion } from "react-bootstrap";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";
import { AppAction, AppContext } from "../App";
import { DappAction, DappContext, getBlockieState } from "../Dapp";
import { PAGE_OVERVIEW } from "../Routes";
import {
  AssetPortfolio,
  AssetPortfolioState,
  AssetPortfolioStates,
  initialAssetPortfolioState,
  initialNSLookupState,
  Networks,
  NSLookupState,
  NSLookupStates,
  TokenData,
} from "../actions/Network";
import { fetchBalances } from "../actions/Ethereum";
import LoaderSkeleton, { SkeletonProfile } from "../layout/LoaderSkeleton";
import Assets, { Asset } from "../components/Assets";
import { Blockie } from "../components/Blockies";
import { Copy } from "../components/IconButtons";
import CryptoIcon from "../components/CryptoIcon";
import { isCacheValid, shortDisplayAddress } from "../utils/data-helpers";
import { useIsMounted } from "../utils/custom-hooks";

import { BalanceCheckerContext } from "./../hardhat/SymfoniContext";

const DEFAULT_REFRESH_INTERVAL = 60;

enum OverviewEvent {
  SYN_BOOT = "SYN_BOOT",
  LISTENING = "LISTENING",
  SYN_REQUESTED_ASSET_LOAD = "SYN_REQUESTED_ASSET_LOAD",
}

export type OverviewEvents =
  | { type: OverviewEvent.SYN_BOOT }
  | { type: OverviewEvent.LISTENING }
  | { type: OverviewEvent.SYN_REQUESTED_ASSET_LOAD; address: string };

enum OverviewAction {
  LOAD_ASSET_STATE = "LOAD_ASSET_STATE",
  SET_ADDRESS = "SET_ADDRESS",
  PUSH_PORTFOLIO = "PUSH_PORTFOLIO",
  BUILD_ASSET_TABLE_DATA = "BUILD_ASSET_TABLE_DATA",
  ACK_BOOT = "ACK_BOOT",
  ACK_REQUESTED_ASSET_LOAD = "ACK_REQUESTED_ASSET_LOAD",
}

type OverviewActions =
  | { type: OverviewAction.LOAD_ASSET_STATE; address: string }
  | { type: OverviewAction.SET_ADDRESS; lookup: NSLookupState }
  | { type: OverviewAction.PUSH_PORTFOLIO; portfolio: AssetPortfolioState }
  | { type: OverviewAction.BUILD_ASSET_TABLE_DATA; tokens: TokenData[]; portfolio: AssetPortfolio }
  | { type: OverviewAction.ACK_BOOT }
  | { type: OverviewAction.ACK_REQUESTED_ASSET_LOAD };

type OverviewState = {
  eventHost: OverviewEvents;
  addressState: NSLookupState;
  assetTableData: Asset[];
  assetPortfolioState: AssetPortfolioState;
  transactionDataState: Record<string, string>; // TODO
};

const initialEventHost: OverviewEvents = {
  type: OverviewEvent.LISTENING,
};

const initialOverviewState = {
  eventHost: { type: OverviewEvent.SYN_BOOT } as OverviewEvents,
  addressState: initialNSLookupState,
  assetPortfolioState: initialAssetPortfolioState,
  assetTableData: [],
  transactionDataState: {},
};

const buildTableData = (tokens: TokenData[], portfolio: AssetPortfolio): Asset[] => {
  return tokens
    .map((token) => ({ ...token, icon: <CryptoIcon name={token.ticker} />, balance: portfolio[token.contract] }))
    .filter((token) => parseInt(portfolio[token.contract]) !== 0)
    .filter((v, i, a) => a.findIndex((t) => t.contract === v.contract) === i);
};

const overviewReducer = (state: OverviewState, action: OverviewActions): OverviewState => {
  switch (action.type) {
    case OverviewAction.LOAD_ASSET_STATE:
      return { ...state, eventHost: { type: OverviewEvent.SYN_REQUESTED_ASSET_LOAD, address: action.address } };
    case OverviewAction.SET_ADDRESS:
      return { ...state, addressState: action.lookup };
    case OverviewAction.PUSH_PORTFOLIO:
      return { ...state, assetPortfolioState: { ...state.assetPortfolioState, ...action.portfolio } };
    case OverviewAction.BUILD_ASSET_TABLE_DATA:
      return { ...state, assetTableData: buildTableData(action.tokens, action.portfolio) };
    case OverviewAction.ACK_BOOT:
    case OverviewAction.ACK_REQUESTED_ASSET_LOAD:
      return { ...state, eventHost: initialEventHost };
  }
};

const Overview = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const dappContext = useContext(DappContext);
  const balanceChecker = useContext(BalanceCheckerContext);
  const { t } = useTranslation();
  const props = useParams();

  const isMounted = useIsMounted();
  const [state, dispatch] = useReducer(overviewReducer, initialOverviewState);

  const networkContracts = dappContext.state.tokenLookupCache.network[Networks.ETHEREUM];

  const getDisplayEnsName = (): JSX.Element => {
    switch (state.addressState.type) {
      case NSLookupStates.EMPTY:
      case NSLookupStates.FETCHING:
        return <LoaderSkeleton type="Bars" />;
      case NSLookupStates.NO_RESOLVE:
      case NSLookupStates.SUCCESS:
        return <address>{shortDisplayAddress(state.addressState.data.address)}</address>;
      case NSLookupStates.ERROR:
        return <></>;
    }
  };

  const getDisplayAddress = (): JSX.Element => {
    switch (state.addressState.type) {
      case NSLookupStates.EMPTY:
      case NSLookupStates.FETCHING:
        return <LoaderSkeleton type="Bars" />;
      case NSLookupStates.NO_RESOLVE:
      case NSLookupStates.SUCCESS:
        return (
          <address>
            {shortDisplayAddress(state.addressState.data.address)}
            <Copy
              copyText={t("copied")}
              tooltip={t("copy")}
              margin={"0 0 0 20px"}
              text={state.addressState.data.address ?? ""}
            />
          </address>
        );
      case NSLookupStates.ERROR:
        return <></>;
    }
  };

  const getPortfolioTable = (): JSX.Element => {
    switch (state.assetPortfolioState.type) {
      case AssetPortfolioStates.EMPTY:
      case AssetPortfolioStates.FETCHING:
        return <LoaderSkeleton type="Paragraphs" bars={8} thickness={20} width="100%" height="200" />;
      case AssetPortfolioStates.SUCCESS:
        return <Assets data={state.assetTableData} />;
      case AssetPortfolioStates.ERROR:
        return <LoaderSkeleton type="Bars" />;
    }
  };

  const navigateInvalid = useCallback(() => {
    if (!props.account && dappContext.state.activeAddress && dappContext.state.activeAddress.data) {
      const path = `/${PAGE_OVERVIEW}/${dappContext.state.activeAddress.data.address}`;
      appContext.dispatch({ type: AppAction.NAVIGATE, path, opts: { replace: true } });
      dispatch({ type: OverviewAction.LOAD_ASSET_STATE, address: `${dappContext.state.activeAddress.data.address}` });
    } else if (props.account && state.addressState.data && props.account !== state.addressState.data.address) {
      const path = `/${PAGE_OVERVIEW}/${props.account}`;
      appContext.dispatch({ type: AppAction.NAVIGATE, path, opts: { replace: true } });
      dispatch({ type: OverviewAction.LOAD_ASSET_STATE, address: props.account });
    }
  }, [appContext, dappContext.state.activeAddress, props.account, state.addressState.data]);

  const returnedAssetPortfolio = useCallback(
    (response: AssetPortfolioState) => {
      if (isMounted.current) {
        dispatch({ type: OverviewAction.PUSH_PORTFOLIO, portfolio: response });

        if (response.type === AssetPortfolioStates.SUCCESS) {
          const cache = dappContext.state.addressPortfolioCache[response.address];

          if (!cache || !isCacheValid(cache.age, DEFAULT_REFRESH_INTERVAL)) {
            dappContext.dispatch({
              type: DappAction.ADD_CACHE_PORTFOLIO,
              address: response.address,
              portfolio: response.data,
            });
          }

          dispatch({
            type: OverviewAction.BUILD_ASSET_TABLE_DATA,
            tokens: networkContracts,
            portfolio: response.data,
          });
        }
      }
    },
    [dappContext, isMounted, networkContracts]
  );

  const resolveAddressBalances = useCallback(
    async (nsLookupState: NSLookupState) => {
      switch (nsLookupState.type) {
        case NSLookupStates.NO_RESOLVE:
        case NSLookupStates.SUCCESS:
          const contractAddresses = networkContracts.map((record) => record.contract);

          if (nsLookupState.data.address && balanceChecker.instance) {
            await fetchBalances(
              nsLookupState.data.address,
              contractAddresses,
              balanceChecker.instance,
              dappContext.state.addressPortfolioCache,
              DEFAULT_REFRESH_INTERVAL
            )(returnedAssetPortfolio).catch((e) => {
              navigateInvalid();
            });
          }
          return;
        case NSLookupStates.EMPTY:
        case NSLookupStates.ERROR:
        case NSLookupStates.FETCHING:
          return;
      }
    },
    [
      networkContracts,
      balanceChecker.instance,
      dappContext.state.addressPortfolioCache,
      returnedAssetPortfolio,
      navigateInvalid,
    ]
  );

  const loadAssetState = useCallback(
    async (address: string) => {
      await dappContext
        .resolveAddress(
          address,
          Networks.ETHEREUM
        )((lookup) => {
          isMounted.current && dispatch({ type: OverviewAction.SET_ADDRESS, lookup: lookup });
        })
        .catch((e) => {
          navigateInvalid();
        });
    },
    [dappContext, isMounted, navigateInvalid]
  );

  const listenEventBus = useCallback(async () => {
    switch (state.eventHost.type) {
      case OverviewEvent.SYN_BOOT:
        dispatch({ type: OverviewAction.ACK_BOOT });
        return props.account && dispatch({ type: OverviewAction.LOAD_ASSET_STATE, address: props.account });
      case OverviewEvent.SYN_REQUESTED_ASSET_LOAD:
        loadAssetState(state.eventHost.address);
        return dispatch({ type: OverviewAction.ACK_REQUESTED_ASSET_LOAD });
      case OverviewEvent.LISTENING:
        return navigateInvalid();
    }
  }, [state.eventHost, props.account, navigateInvalid, loadAssetState]);

  useEffect(() => {
    resolveAddressBalances(state.addressState);
  }, [state.addressState, resolveAddressBalances]);

  useEffect(() => {
    listenEventBus();
  }, [listenEventBus]);

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
                  skeleton={<SkeletonProfile />}
                  state={getBlockieState(state.addressState.type)}
                  address={state.addressState.data?.address ?? ""}
                />
              </BlockieStyle>{" "}
              <figcaption>
                <h2>{getDisplayEnsName()}</h2>
                <h3>{getDisplayAddress()}</h3>
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
            <Accordion.Body>{getPortfolioTable()}</Accordion.Body>
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
