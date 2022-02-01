import React, { useCallback, useEffect, useReducer, useRef } from "react";
import { Spinner } from "react-bootstrap";
import styled from "styled-components";
import { ethers } from "ethers";
import { faGasPump } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  EtherUnits,
  fetchGasPrice,
  gasePriceReducer,
  GasPriceState,
  GasPriceStates,
  initiaGasPriceState,
} from "../actions/Ethereum";

type Props = {
  provider: ethers.providers.Provider;
  format?: EtherUnits;
  interval?: number;
};

const Gastimate: React.FunctionComponent<Props> = ({ provider, format = "gwei", interval = 50000 }): JSX.Element => {
  const isActive = useRef(true);
  const [gasPrice, dispatchGasPrice] = useReducer(gasePriceReducer, initiaGasPriceState);

  const dispatchAssist = (state: GasPriceState): void => {
    if (isActive.current) {
      dispatchGasPrice(state);
    }
  };

  const displayGasPrice = (state: GasPriceState): JSX.Element => {
    switch (state.type) {
      case GasPriceStates.EMPTY:
        return <span>Please wait...</span>;
      case GasPriceStates.FETCHING:
        return (
          <span>
            <Spinner animation="border" size="sm" />
          </span>
        );
      case GasPriceStates.SUCCESS:
        return (
          <span>
            {parseInt(gasPrice.data ?? "0")} {format.toUpperCase()}
          </span>
        );
      case GasPriceStates.ERROR:
        return <span>Error fetching!</span>;
    }
  };

  const gasResolver = useCallback(async () => {
    fetchGasPrice(format, provider)(dispatchAssist);
  }, [format, provider]);

  useEffect(() => {
    gasResolver();
    const intervalId = setInterval(() => {
      gasResolver();
    }, interval);

    return () => {
      clearInterval(intervalId);
      isActive.current = false;
    };
  }, [gasResolver, interval]);

  return (
    <GastimateStyle>
      <FontAwesomeIcon icon={faGasPump} /> {displayGasPrice(gasPrice)}
    </GastimateStyle>
  );
};

export default Gastimate;

const GastimateStyle = styled.span`
  & span {
    padding-left: 10px;
  }
`;
