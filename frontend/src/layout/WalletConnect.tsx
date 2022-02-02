import React, { useCallback, useContext, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, Spinner } from "react-bootstrap";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useEthers } from "@usedapp/core";

import { EnsLookupState, EnsLookupStates, fetchAddress } from "../actions/Ethereum";
import { ThemeEngine } from "../styles/GlobalStyle";
import { AppContext } from "../App";
import { DappContext } from "../Dapp";
import { ToasterTypes } from "./Toaster";
import { Blockie, BlockieState } from "../components/Blockies";
import Copy from "../components/Copy";
import { shortDisplayAddress } from "../utils/data-helpers";

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

// TODO Find a better place for this
export const getBlockieState = (state: EnsLookupStates) => {
  switch (state) {
    case EnsLookupStates.EMPTY:
      return BlockieState.EMPTY;
    case EnsLookupStates.ERROR:
      return BlockieState.ERROR;
    case EnsLookupStates.FETCHING:
      return BlockieState.FETCHING;
    case EnsLookupStates.NO_RESOLVE:
    case EnsLookupStates.SUCCESS:
      return BlockieState.SUCCESS;
  }
};

const WalletConnect: React.FunctionComponent = (): JSX.Element => {
  const appContext = useContext(AppContext);
  const dappContext = useContext(DappContext);
  const { t } = useTranslation();
  const { activateBrowserWallet, account, error, active, deactivate } = useEthers();

  const isActive = useRef(true);
  const [walletButtonState, setWalletButtonState] = useState<WalletMenuStates>(WalletMenuStates.CLOSED);

  if (error) {
    appContext.toast(error.message, ToasterTypes.ERROR);
  }

  const activateConnection = async () => {
    activateBrowserWallet();
  };

  const deactivateConnection = () => {
    dappContext.setActiveAddress(undefined);
    dappContext.setUserAddresses([]);
    deactivate();
    appContext.toast(t("disconnected"), ToasterTypes.ERROR);
  };

  const setAddressCloseMenu = (lookup: EnsLookupState) => {
    dappContext.setActiveAddress(lookup);
    setWalletButtonState(WalletMenuStates.CLOSED);
    appContext.toast(
      `${t("notification.account_switched")}${shortDisplayAddress(lookup.data?.address)}`,
      ToasterTypes.SUCCESS
    );
  };

  const toggleWalletButtonState = () => {
    if (walletButtonState === WalletMenuStates.OPENED) {
      setWalletButtonState(WalletMenuStates.CLOSED);
    } else {
      setWalletButtonState(WalletMenuStates.OPENED);
    }
  };

  const getProfileContents = (): JSX.Element | undefined => {
    return dappContext.activeAddress ? (
      <figure>
        <BlockieStyle
          state={getBlockieState(dappContext.activeAddress.type)}
          address={dappContext.activeAddress.data?.address ?? ""}
          size={48}
        />{" "}
        <figcaption>
          <span>{shortDisplayAddress(dappContext.activeAddress.data?.address)}</span>
          {dappContext.activeAddress.data?.ens && <address>{dappContext.activeAddress.data.ens}</address>}
        </figcaption>
        <FontAwesomeIcon icon={faChevronDown} />
      </figure>
    ) : (
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    );
  };

  const getAllAccounts = (): JSX.Element[] => {
    return dappContext.userAddresses.map((lookup) =>
      lookup.data ? (
        <figure key={lookup.data.address}>
          <button onClick={() => setAddressCloseMenu(lookup)}>
            <BlockieStyle state={getBlockieState(lookup.type)} address={lookup.data.address} size={48} />{" "}
            <figcaption>
              {shortDisplayAddress(lookup.data.address)}
              {lookup.data.ens && <address>{lookup.data.ens}</address>}
            </figcaption>
          </button>
          <Copy copyText={t("copied")} text={lookup.data.address ?? ""} />
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
    (state: EnsLookupState) => {
      switch (state.type) {
        case EnsLookupStates.SUCCESS:
        case EnsLookupStates.NO_RESOLVE:
          dappContext.setUserAddresses(Array.from(new Set([state, ...dappContext.userAddresses])));
          appContext.toast(
            `${t("notification.account_added")}${shortDisplayAddress(state.data?.address)}`,
            ToasterTypes.SUCCESS
          );
          break;
        case EnsLookupStates.ERROR:
          appContext.toast(`${t("error")} ${state.error}`, ToasterTypes.ERROR);
          break;
      }
    },
    [dappContext, appContext, t]
  );

  const addressResolver = useCallback(() => {
    if (active && account && dappContext.lookupUserAddress(account, true) === undefined) {
      fetchAddress({ address: account }, dappContext.ethersProvider)(addUserAddress);
    }
    //  else if (active && !account) {
    //   activateConnection();
    // }
  }, [active, account, addUserAddress, dappContext]);

  useEffect(() => {
    addressResolver();
  }, [addressResolver]);

  useEffect(() => {
    return () => {
      isActive.current = false;
    };
  }, [dappContext, isActive]);

  return active && !!dappContext.activeAddress?.data ? (
    <AccountControlStyle>
      <button onClick={toggleWalletButtonState}>{getProfileContents()}</button>
      <AccountMenuStyle state={walletButtonState}>
        <em>{t("accounts")}</em>
        {getAllAccounts()}
        <hr />
        {getDisconnect()}
      </AccountMenuStyle>
    </AccountControlStyle>
  ) : (
    <article>
      <h1>{t("welcome")}</h1>
      <p>{t("content.connect")}</p>
      <Button onClick={() => activateConnection()}>{t("connect")}</Button>
    </article>
  );
};

export default WalletConnect;

const BlockieStyle = styled(Blockie)`
  top: 0;
  left: 0;
  display: inline;
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
