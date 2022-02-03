import React from "react";
import styled from "styled-components";
import { Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle, faUser } from "@fortawesome/free-solid-svg-icons";
import makeBlockie from "ethereum-blockies-base64";

type BlockiesProps = {
  addresses: string[];
  states: Record<string, BlockieState>;
  enses?: Record<string, string>;
};

type BlockieProps = {
  state: BlockieState;
  address: string;
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

export const Blockie: React.FunctionComponent<BlockieProps> = ({ state, address, ens = null }): JSX.Element => {
  switch (state) {
    case BlockieState.SUCCESS:
      if (ens) {
        return (
          <figure>
            <img src={makeBlockie(address ?? "")} alt={address} />
            <address>{<BlockieEnsStyle>{ens ?? formatAddress(address)}</BlockieEnsStyle>}</address>
          </figure>
        );
      } else {
        return <img src={makeBlockie(address ?? "")} alt={address} />;
      }
    case BlockieState.FETCHING:
      return <Spinner animation="border" />;
    case BlockieState.ERROR:
      return <FontAwesomeIcon icon={faExclamationTriangle} />;
    case BlockieState.EMPTY:
      return <FontAwesomeIcon icon={faUser} />;
  }
};

export const Blockies = ({ states, addresses }: BlockiesProps): JSX.Element[] => {
  return addresses.map((address, i) => <Blockie key={i} state={states[address]} address={address} />);
};

const BlockieEnsStyle = styled.cite`
  display: block;
  text-align: center;
`;
