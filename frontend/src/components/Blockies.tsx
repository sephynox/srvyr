import React from "react";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import makeBlockie from "ethereum-blockies-base64";

type BlockiesProps = {
  addresses: string[];
  skeleton: JSX.Element;
  states: Record<string, BlockieState>;
  enses?: Record<string, string>;
};

type BlockieProps = {
  state: BlockieState;
  address: string;
  skeleton: JSX.Element;
  key?: number | string;
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

export const Blockie: React.FunctionComponent<BlockieProps> = ({
  state,
  address,
  skeleton,
  key,
  ens = null,
}): JSX.Element => {
  switch (state) {
    case BlockieState.SUCCESS:
      if (ens) {
        return (
          <figure key={key}>
            <BlockieStyle src={makeBlockie(address ?? "")} alt={address} />
            <address>{<BlockieEnsStyle>{ens ?? formatAddress(address)}</BlockieEnsStyle>}</address>
          </figure>
        );
      } else {
        return <img src={makeBlockie(address ?? "")} alt={address} />;
      }
    case BlockieState.EMPTY:
    case BlockieState.FETCHING:
      return <span key={key}>{skeleton}</span>;
    case BlockieState.ERROR:
      return <FontAwesomeIcon key={key} icon={faExclamationTriangle} />;
  }
};

export const Blockies = ({ states, addresses, skeleton }: BlockiesProps): JSX.Element[] => {
  return addresses.map((address, i) => (
    <Blockie key={i} state={states[address]} address={address} skeleton={skeleton} />
  ));
};

const BlockieStyle = styled.img`
  width: 100%;
  max-width: ${(props: { width: number }) => `${props.width}px` ?? "100%"};
  border-radius: 10%;
`;

const BlockieEnsStyle = styled.cite`
  display: block;
  text-align: center;
`;
