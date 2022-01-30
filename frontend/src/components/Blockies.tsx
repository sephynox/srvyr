import React from "react";
import styled from "styled-components";
import { Image } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faUser } from "@fortawesome/free-solid-svg-icons";
import makeBlockie from "ethereum-blockies-base64";

import LoaderSpinner from "./LoaderSpinner";

const BLOCKIE_DEFAULT_SIZE = 50;

type BlockiesProps = {
  addresses: string[];
  states: Record<string, BlockieState>;
  size: number;
  enses?: Record<string, string>;
};

type BlockieProps = {
  state: BlockieState;
  address: string;
  size?: number;
  ens?: string | null;
};

export enum BlockieState {
  EMPTY,
  FETCHING,
  ERROR,
  SUCCESS,
}

const formatAddress = (address: string) =>
  `${address.substring(0, 5)}...${address.substring(address.length - 4, address.length)}`;

export const Blockie = ({ state, address, size = BLOCKIE_DEFAULT_SIZE, ens = null }: BlockieProps): JSX.Element => {
  switch (state) {
    case BlockieState.SUCCESS:
      if (ens) {
        return (
          <figure>
            <BlockieStyle src={makeBlockie(address ?? "")} alt={address} width={size} />
            <address>{<BlockieEnsStyle>{ens ?? formatAddress(address)}</BlockieEnsStyle>}</address>
          </figure>
        );
      } else {
        return <BlockieStyle src={makeBlockie(address ?? "")} alt={address} width={size} />;
      }
    case BlockieState.FETCHING:
      return <LoaderSpinner type="Circle" size={16} />;
    case BlockieState.ERROR:
      return <FontAwesomeIcon icon={faExclamationTriangle} />;
    case BlockieState.EMPTY:
      return <FontAwesomeIcon icon={faUser} />;
  }
};

export const Blockies = ({ states, addresses, size = BLOCKIE_DEFAULT_SIZE }: BlockiesProps): JSX.Element[] => {
  return addresses.map((address, i) => <Blockie key={i} state={states[address]} address={address} size={size} />);
};

const BlockieStyle = styled(Image)`
  width: ${(props: { width: number }) => (props.width ? `${props.width}px` : "100%")} !important;
  height: ${(props: { width: number }) => (props.width ? `${props.width}px` : "100%")} !important;
  border-radius: 10%;
`;

const BlockieEnsStyle = styled.cite`
  display: block;
  text-align: center;
`;
