import React, { useContext } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import styled from "styled-components";
import { useEthers } from "@usedapp/core";

import WalletConnect from "../layout/WalletConnect";
import { Section } from "../styles/Section";
import { DappContext } from "../Dapp";
import Assets from "../components/Assets";

const Overview = (): JSX.Element => {
  const dappContext = useContext(DappContext);
  const { t } = useTranslation();
  const props = useParams();
  const { active } = useEthers();

  const title = t("overview");

  return !!active ? (
    <>
      <Assets data={[]} />
    </>
  ) : (
    <WalletConnectStyle>
      <WalletConnect />
    </WalletConnectStyle>
  );
};

export default Overview;

const WalletConnectStyle = styled(Section)`
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;

  & article section {
    text-align: center;
  }
`;
