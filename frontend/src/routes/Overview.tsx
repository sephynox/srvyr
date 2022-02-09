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
  FetchState,
  FetchStates,
  initialNSLookupState,
  Networks,
  NSLookupState,
  NSLookupStates,
  PriceLookupCache,
  TokenData,
} from "../actions/Network";
import { fetchBalances, fetchTokenPrices } from "../actions/Ethereum";
import LoaderSkeleton, { SkeletonProfile } from "../layout/LoaderSkeleton";
import { AssetTableData, AssetPieData, AssetsPie, AssetsTable } from "../components/Assets";
import { Blockie } from "../components/Blockies";
import { Copy } from "../components/IconButtons";
import { isCacheValid, shortDisplayAddress } from "../utils/data-helpers";
import { useIsMounted } from "../utils/custom-hooks";

import { BalanceCheckerContext } from "./../hardhat/SymfoniContext";
import usePriced from "../services/price-daemon";
import { buildPieData, buildTableData, getTotalPortfolioValue } from "../tools/ChartData";
import { fetchPriceFeeds } from "../tools/CacheData";

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
  BUILD_ASSET_CHART_DATA = "BUILD_ASSET_CHART_DATA",
  ACK_BOOT = "ACK_BOOT",
  ACK_REQUESTED_ASSET_LOAD = "ACK_REQUESTED_ASSET_LOAD",
}

type OverviewActions =
  | { type: OverviewAction.LOAD_ASSET_STATE; address: string }
  | { type: OverviewAction.SET_ADDRESS; lookup: NSLookupState }
  | { type: OverviewAction.PUSH_PORTFOLIO; portfolio: FetchState<{ address: string; portfolio: AssetPortfolio }> }
  | {
      type: OverviewAction.BUILD_ASSET_CHART_DATA;
      tokens: Record<string, TokenData>;
      portfolio: AssetPortfolio;
      prices?: PriceLookupCache;
    }
  | { type: OverviewAction.ACK_BOOT }
  | { type: OverviewAction.ACK_REQUESTED_ASSET_LOAD };

type OverviewState = {
  eventHost: OverviewEvents;
  addressState: NSLookupState;
  assetTableData: AssetTableData[];
  assetPieData: AssetPieData[];
  assetPortfolioValue: number;
  assetPortfolioState: FetchState<{ address: string; portfolio: AssetPortfolio }>;
  transactionDataState: Record<string, string>; // TODO
};

const initialEventHost: OverviewEvents = {
  type: OverviewEvent.LISTENING,
};

export const initialAssetPortfolioState: FetchState<{ address: string; portfolio: AssetPortfolio }> = {
  type: FetchStates.EMPTY,
  data: { address: "", portfolio: {} },
};

const initialOverviewState = {
  eventHost: { type: OverviewEvent.SYN_BOOT } as OverviewEvents,
  addressState: initialNSLookupState,
  assetPortfolioState: initialAssetPortfolioState,
  assetTableData: [],
  assetPieData: [],
  assetPortfolioValue: 0,
  transactionDataState: {},
};

const overviewReducer = (state: OverviewState, action: OverviewActions): OverviewState => {
  switch (action.type) {
    case OverviewAction.LOAD_ASSET_STATE:
      return { ...state, eventHost: { type: OverviewEvent.SYN_REQUESTED_ASSET_LOAD, address: action.address } };
    case OverviewAction.SET_ADDRESS:
      return { ...state, addressState: action.lookup };
    case OverviewAction.PUSH_PORTFOLIO:
      return { ...state, assetPortfolioState: { ...state.assetPortfolioState, ...action.portfolio } };
    case OverviewAction.BUILD_ASSET_CHART_DATA:
      const assetTableData = buildTableData(action.tokens, action.portfolio, action.prices);
      const assetPieData = buildPieData(action.tokens, action.portfolio, action.prices);
      const totalValue = getTotalPortfolioValue(action.portfolio, action.prices);
      return { ...state, assetTableData: assetTableData, assetPieData: assetPieData, assetPortfolioValue: totalValue };
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

  const [tokens, feeds] = fetchPriceFeeds(networkContracts, dappContext.state.userCurrency);
  const priceDaemon = usePriced(fetchTokenPrices(tokens, feeds, balanceChecker), (data) => {
    dappContext.dispatch({ type: DappAction.RESOLVE_TOKEN_PRICES, prices: data });
  });

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
      case FetchStates.EMPTY:
      case FetchStates.FETCHING:
        return <LoaderSkeleton type="Paragraphs" bars={8} thickness={20} width="100%" height="200" />;
      case FetchStates.SUCCESS:
        return (
          <AssetsTable
            total={state.assetPortfolioValue}
            currency={dappContext.state.userCurrency.ticker}
            data={state.assetTableData}
          />
        );
      case FetchStates.ERROR:
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
    (response: FetchState<{ address: string; portfolio: AssetPortfolio }>) => {
      if (isMounted.current) {
        dispatch({ type: OverviewAction.PUSH_PORTFOLIO, portfolio: response });

        if (response.type === FetchStates.SUCCESS) {
          const cache = dappContext.state.addressPortfolioCache[response.data.address];

          if (!cache || !isCacheValid(cache.age, DEFAULT_REFRESH_INTERVAL)) {
            dappContext.dispatch({
              type: DappAction.ADD_CACHE_PORTFOLIO,
              address: response.data.address,
              portfolio: response.data.portfolio,
            });
          }

          dispatch({
            type: OverviewAction.BUILD_ASSET_CHART_DATA,
            tokens: networkContracts,
            portfolio: response.data.portfolio,
            prices: dappContext.state.priceLookupCache,
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
          const contractAddresses = Object.values(networkContracts).map((record) => record.contract);

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
    return () => clearInterval(priceDaemon);
  }, [listenEventBus, priceDaemon]);

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
            <figure>
              <AssetsPie height={100} width={100} data={state.assetPieData} />
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
  display: flex;
  justify-content: space-between;
  flex-direction: row;

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
    display: block;

    & figure {
      justify-content: center;
    }
  }
`;
