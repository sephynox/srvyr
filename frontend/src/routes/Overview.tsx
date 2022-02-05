import React, { useCallback, useContext, useEffect, useReducer } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Accordion } from "react-bootstrap";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { Section } from "../styles/Section";
import { DappAction, DappContext, getBlockieState } from "../Dapp";
import {
  AssetPortfolioState,
  AssetPortfolioStates,
  initialAssetPortfolioState,
  initialNSLookupState,
  Networks,
  NSLookupState,
  NSLookupStates,
} from "../actions/Network";
import { fetchBalances } from "../actions/Ethereum";
import LoaderSkeleton, { SkeletonProfile } from "../layout/LoaderSkeleton";
import Assets from "../components/Assets";
import { Blockie } from "../components/Blockies";
import { Copy } from "../components/IconButtons";
import { isCacheValid, shortDisplayAddress } from "../utils/data-helpers";
import { useIsMounted } from "../utils/custom-hooks";

import { BalanceCheckerContext } from "./../hardhat/SymfoniContext";

const DEFAULT_REFRESH_INTERVAL = 60;

enum OverviewAction {
  SET_ADDRESS = "SET_ADDRESS",
  PUSH_PORTFOLIO = "PUSH_PORTFOLIO",
}

type OverviewActions =
  | { type: OverviewAction.SET_ADDRESS; lookup: NSLookupState }
  | { type: OverviewAction.PUSH_PORTFOLIO; portfolio: AssetPortfolioState };

type OverviewState = {
  addressState: NSLookupState;
  assetPortfolioState: AssetPortfolioState;
  transactionDataState: Record<string, string>; // TODO
};

const initialOverviewState = {
  addressState: initialNSLookupState,
  assetPortfolioState: initialAssetPortfolioState,
  transactionDataState: {},
};

const overviewReducer = (state: OverviewState, action: OverviewActions): OverviewState => {
  switch (action.type) {
    case OverviewAction.SET_ADDRESS:
      return { ...state, addressState: action.lookup };
    case OverviewAction.PUSH_PORTFOLIO:
      return { ...state, assetPortfolioState: { ...state.assetPortfolioState, ...action.portfolio } };
  }
};

const Overview = (): JSX.Element => {
  const dappContext = useContext(DappContext);
  const balanceChecker = useContext(BalanceCheckerContext);
  const { t } = useTranslation();
  const props = useParams();
  const navigate = useNavigate();

  const isMounted = useIsMounted();
  const [state, dispatch] = useReducer(overviewReducer, initialOverviewState);

  const navigateInvalid = useCallback(() => {
    if (dappContext.state.activeAddress && dappContext.state.activeAddress.data) {
      navigate(`${dappContext.state.activeAddress.data.address}`, { replace: true });
      return false;
    } else {
      navigate("/");
      return false;
    }
  }, [dappContext.state.activeAddress, navigate]);

  const checkValidAsset = useCallback((): boolean => {
    if (!props.account) {
      navigateInvalid();
      return false;
    } else {
      return true;
    }
  }, [navigateInvalid, props.account]);

  const getDisplayEnsName = (): JSX.Element => {
    return state.addressState.data ? (
      <address>
        {state.addressState.data?.ns
          ? state.addressState.data.ns
          : shortDisplayAddress(state.addressState.data?.address)}
      </address>
    ) : (
      <LoaderSkeleton type="Bars" />
    );
  };

  const getDisplayAddress = (): JSX.Element => {
    return state.addressState.data ? (
      <>
        <address>
          {shortDisplayAddress(state.addressState.data?.address)}
          <Copy
            copyText={t("copied")}
            tooltip={t("copy")}
            margin={"0 0 0 20px"}
            text={state.addressState.data?.address ?? ""}
          />
        </address>
      </>
    ) : (
      <LoaderSkeleton type="Bars" />
    );
  };

  const resolveAddressBalances = useCallback(
    async (nsLookupState: NSLookupState) => {
      const networkContracts = dappContext.state.tokenLookupCache.network[Networks.ETHEREUM];

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
            )((response: AssetPortfolioState) => {
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
                }
              }
            }).catch((e) => {
              navigateInvalid();
            });
          }
          break;
      }
    },
    [balanceChecker.instance, dappContext, isMounted, navigateInvalid]
  );

  const loadAssetState = useCallback(async () => {
    if (props.account && state.addressState.type === NSLookupStates.EMPTY) {
      await dappContext
        .resolveAddress(
          props.account,
          Networks.ETHEREUM
        )((lookup) => {
          isMounted.current && dispatch({ type: OverviewAction.SET_ADDRESS, lookup: lookup });
        })
        .catch((e) => {
          navigateInvalid();
        });
    }
  }, [dappContext, isMounted, props.account, state.addressState.type, navigateInvalid]);

  useEffect(() => {
    if (checkValidAsset()) {
      loadAssetState();
    }
  }, [checkValidAsset, loadAssetState]);

  useEffect(() => {
    resolveAddressBalances(state.addressState);
  }, [state.addressState, resolveAddressBalances]);

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
