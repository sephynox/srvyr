import { Currency } from "@usedapp/core";

import { Contract, TokenData } from "../actions/Network";

export const fetchPriceFeeds = (tokens: Record<string, TokenData>, currency: Currency): [Contract[], Contract[]] => {
  const contracts: Contract[] = [];
  const feeds: Contract[] = [];

  Object.keys(tokens).forEach((token) => {
    const data = tokens[token];
    const key = currency.ticker.toLowerCase();

    if (data.feeds && data.feeds[key]) {
      contracts.push(token);
      feeds.push(data.feeds[key].contract);
    }
  });

  return [contracts, feeds];
};
