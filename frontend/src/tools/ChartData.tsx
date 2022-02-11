import React from "react";

import { AssetPortfolio, PriceLookupCache, TokenData, Transaction } from "../actions/Network";
import { AssetPieData, AssetTableData, TransactionTableData } from "../components/Assets";
import CryptoIcon from "../components/CryptoIcon";

export const buildAssetTableData = (
  tokens: Record<string, TokenData>,
  portfolio: AssetPortfolio,
  prices?: PriceLookupCache
): AssetTableData[] => {
  return Object.keys(portfolio)
    .map((c) => ({
      ...tokens[c],
      icon: <CryptoIcon name={tokens[c].ticker} />,
      balance: portfolio[c],
      price: prices && prices[c] ? prices[c].data.price : "0",
    }))
    .filter((t) => parseInt(portfolio[t.contract]) !== 0)
    .filter((v, i, a) => a.findIndex((t) => t.contract === v.contract) === i);
};

export const buildTransactionTableData = (transactions: Transaction[]): TransactionTableData[] => {
  return transactions
    .map((t) => ({
      timestamp: t.timestamp,
      type: t.type,
      from: t.from,
      to: t.to,
      data: t.data,
    }))
    .sort((a, b) => b.timestamp - a.timestamp);
};

export const buildPieData = (
  tokens: Record<string, TokenData>,
  portfolio: AssetPortfolio,
  prices?: PriceLookupCache
): AssetPieData[] => {
  const data = Object.keys(portfolio).map((c) =>
    Object({
      name: tokens[c].ticker,
      value: prices && prices[c] ? Number(prices[c].data.price) * Number(portfolio[c]) : 0,
    })
  );
  return data.filter((data: AssetPieData) => data.value !== 0);
};

// TODO Handle big numbers
export const getTotalPortfolioValue = (portfolio: AssetPortfolio, prices?: PriceLookupCache): number => {
  let value = 0;
  Object.keys(portfolio).forEach((c) => {
    if (prices && prices[c]) {
      value += Number(prices[c].data.price) * Number(portfolio[c]);
    }
  });
  return value;
};
