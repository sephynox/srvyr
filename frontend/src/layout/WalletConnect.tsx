import React, { useCallback, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTimes, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useEthers } from "@usedapp/core";

import { ThemeEngine } from "../styles/GlobalStyle";
import { AppAction, AppContext } from "../App";
import { DappAction, DappContext, getBlockieState } from "../Dapp";
import { ToasterTypes } from "./Toaster";
import { SkeletonProfile } from "./LoaderSkeleton";
import { Networks, NSLookupState, NSLookupStates } from "../actions/Network";
import { fetchAddress } from "../actions/Ethereum";
import { Blockie } from "../components/Blockies";
import { Action, Copy } from "../components/IconButtons";
import { shortDisplayAddress } from "../utils/data-helpers";
import { useIsMounted } from "../utils/custom-hooks";

enum WalletMenuStates {
  OPENED,
  CLOSED,
}

export const CenterWalletConnectStyle = styled.section`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & article section {
    text-align: center;
  }
`;

const WalletConnect: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const dappContext = useContext(DappContext);
  const { t } = useTranslation();
  const { activateBrowserWallet, account, error, active, deactivate } = useEthers();

  const isMounted = useIsMounted();
  const [walletButtonState, setWalletButtonState] = useState<WalletMenuStates>(WalletMenuStates.CLOSED);

  if (error) {
    appContext.dispatch({ type: AppAction.TOAST, toast: ToasterTypes.ERROR, message: error.message });
  }

  const activateConnection = async () => {
    try {
      await activateBrowserWallet();
    } catch (e) {
      alert(JSON.stringify(e));
    }
  };

  const deactivateConnection = () => {
    dappContext.dispatch({ type: DappAction.DISCONNECT });
    deactivate();
  };

  const removeAddress = (address: NSLookupState) => {
    const index = dappContext.state.userAddresses.indexOf(address);

    if (dappContext.state.userAddresses.length === 1 && address === dappContext.state.userAddresses[index]) {
      deactivateConnection();
    } else if (dappContext.state.userAddresses[index]) {
      dappContext.dispatch({ type: DappAction.REMOVE_USER_ADDRESS, address: index });
    }
  };

  const setAddressCloseMenu = (lookup: NSLookupState) => {
    dappContext.dispatch({ type: DappAction.SET_ACTIVE_ADDRESS, address: lookup });
    setWalletButtonState(WalletMenuStates.CLOSED);
  };

  const toggleWalletButtonState = () => {
    if (walletButtonState === WalletMenuStates.OPENED) {
      setWalletButtonState(WalletMenuStates.CLOSED);
    } else {
      setWalletButtonState(WalletMenuStates.OPENED);
    }
  };

  const getProfileContents = (): JSX.Element | undefined => {
    return dappContext.state.activeAddress ? (
      <figure>
        <BlockieStyle size={48}>
          <Blockie
            skeleton={<SkeletonProfile />}
            state={getBlockieState(dappContext.state.activeAddress.type)}
            address={dappContext.state.activeAddress.data?.address ?? ""}
          />
        </BlockieStyle>{" "}
        <figcaption>
          <span>{shortDisplayAddress(dappContext.state.activeAddress.data?.address)}</span>
          {dappContext.state.activeAddress.data?.ns && <address>{dappContext.state.activeAddress.data.ns}</address>}
        </figcaption>
        <FontAwesomeIcon icon={faChevronDown} />
      </figure>
    ) : (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">{t("loading")}</span>
      </Spinner>
    );
  };

  const getAllAccounts = (): JSX.Element[] => {
    return dappContext.state.userAddresses.map((lookup, i) =>
      lookup.data ? (
        <figure key={lookup.data.address}>
          <button onClick={() => setAddressCloseMenu(lookup)}>
            <BlockieStyle size={48}>
              <Blockie
                skeleton={<SkeletonProfile />}
                state={getBlockieState(lookup.type)}
                address={lookup.data.address ?? ""}
              />
            </BlockieStyle>{" "}
            <figcaption>
              {shortDisplayAddress(lookup.data.address)}
              {lookup.data.ns && <address>{lookup.data.ns}</address>}
            </figcaption>
          </button>
          <Copy copyText={t("copied")} tooltip={t("copy")} text={lookup.data.address ?? ""} />
          <Action
            action={() => removeAddress(lookup)}
            icon={faTrash}
            tooltip={t("delete")}
            tooltipHover={true}
            margin={"0 0 0 20px"}
          />
        </figure>
      ) : (
        <></>
      )
    );
  };

  const getDisconnect = (): JSX.Element => (
    <figure>
      <button onClick={() => deactivateConnection()}>
        <FontAwesomeIcon icon={faTimes} />
        <figcaption>{t("disconnect")}</figcaption>
      </button>
    </figure>
  );

  const addUserAddress = useCallback(
    (state: NSLookupState) => {
      if (isMounted) {
        switch (state.type) {
          case NSLookupStates.SUCCESS:
          case NSLookupStates.NO_RESOLVE:
            if (dappContext.state.userAddresses.some((ns) => ns.data?.address === state.data.address)) {
              return;
            }

            dappContext.dispatch({ type: DappAction.ADD_USER_ADDRESS, address: state });
            break;
          case NSLookupStates.ERROR:
            appContext.dispatch({
              type: AppAction.TOAST,
              toast: ToasterTypes.ERROR,
              message: `${t("error")} ${state.error}`,
            });
            break;
        }
      }
    },
    [isMounted, dappContext, appContext, t]
  );

  const addressResolver = useCallback(() => {
    if (active && account && dappContext.lookupUserAddress(account, true) === undefined) {
      fetchAddress({ network: Networks.ETHEREUM, address: account }, dappContext.ethersProvider)(addUserAddress);
    }
  }, [active, account, addUserAddress, dappContext]);

  useEffect(() => {
    addressResolver();
  }, [addressResolver]);

  switch (dappContext.state.activeAddress.type) {
    case NSLookupStates.EMPTY:
      return (
        <article>
          <h1>{t("welcome")}</h1>
          <p>{t("content.connect")}</p>
          <Button onClick={() => activateConnection()}>{t("connect")}</Button>
        </article>
      );
    case NSLookupStates.ERROR:
      return <Spinner animation="border" />;
    case NSLookupStates.NO_RESOLVE:
    case NSLookupStates.SUCCESS:
      return (
        <AccountControlStyle>
          <button onClick={toggleWalletButtonState}>{getProfileContents()}</button>
          <AccountMenuStyle state={walletButtonState}>
            <em>{t("accounts")}</em>
            {getAllAccounts()}
            <hr />
            {getDisconnect()}
          </AccountMenuStyle>
        </AccountControlStyle>
      );
    case NSLookupStates.FETCHING:
      return <Spinner animation="border" />;
  }
};

export default WalletConnect;

const BlockieStyle = styled.span`
  & img {
    top: 0;
    left: 0;
    width: ${(props: { size: number }) => (props.size ? `${props.size}px` : "100%")} !important;
    height: ${(props: { size: number }) => (props.size ? `${props.size}px` : "100%")} !important;
    border-radius: 10%;
  }
`;

const AccountMenuStyle = styled.aside`
  display: ${(props: { state: WalletMenuStates }) => (props.state === WalletMenuStates.CLOSED ? "none" : "block")};
  position: fixed;
  z-index: 999;

  min-width: 210px;
  padding-top: 15px;
  padding-bottom: 15px;

  background-color: ${(props: ThemeEngine) => props.theme.backgroundSecondaryActive};

  & figure {
    padding: 10px 10px 10px 20px;
    display: flex;
    flex-direction: row;

    & button {
      display: flex;
      flex-direction: row;
      align-items: center;
      width: auto;
    }

    & button:first-child {
      flex-grow: 2;
    }

    & button:last-child svg {
      margin-right: 10px;
    }
  }

  & em {
    display: block;
    padding-left: 20px;
    padding-bottom: 10px;
  }

  & figure figcaption,
  svg {
    margin-left: 10px;
    flex-grow: 1;
  }

  @media (min-width: 993px) {
    left: 15px;
    right: 0;
    margin-top: 10px;
    z-index: 1000;
    max-width: var(--srvyr-header-width);

    box-shadow: 0px 8px 16px 0px rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }

  @media screen and (max-width: 992px) {
    width: calc(var(--srvyr-header-width) - 31px);

    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
  }
`;

const AccountControlStyle = styled.article`
  position: static;

  > button {
    padding: 5px;
    border-radius: 10px;
  }

  > button figure {
    width: 100%;
    padding: 10px 10px 10px 5px;
  }

  > button:hover {
    background-color: ${(props: ThemeEngine) => props.theme.info};
  }

  > figure:hover {
    background-color: ${(props: ThemeEngine) => props.theme.linkHover};
  }

  & figure {
    display: inline-flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin: 0;
  }

  & figure figcaption {
    display: flex;
    flex-direction: column;
  }

  & figure figcaption,
  svg {
    margin-left: 10px;
    flex-grow: 1;
  }

  & figure figcaption address {
    margin: 0;
    max-width: calc(var(--srvyr-header-width) - 130px);

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  & button {
    border: 0;
    padding: 0;
    margin: 0;
    width: 100%;
    text-align: left;

    color: ${(props: ThemeEngine) => props.theme.text};
    background-color: transparent;
  }

  & aside figure {
    width: 100%;
  }

  & aside figure:hover {
    background-color: ${(props: ThemeEngine) => props.theme.backgroundSecondary};
  }

  @media screen and (max-width: 992px) {
    > button {
      border-top-right-radius: 10px;
      border-top-right-radius: 10px;
      border-bottom-left-radius: 0px;
      border-bottom-right-radius: 0px;
    }
  }
`;
