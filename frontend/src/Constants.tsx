import { Mainnet, Config, ChainId } from "@usedapp/core";

export const DEV_MODE = "production" !== process.env.NODE_ENV;
export const SITE_BASE_URL = window.location.origin;
export const SITE_NAME = "SRVYR";
export const DEFAULT_LANG = "en-US";
export const DEFAULT_CURRENCY = "USD";
export const DEFAULT_PRICE_PLACES = 2;
export const DEFAULT_PERCENT_PLACES = 2;
export const DEFAULT_PRICE_PERCENTAGE_CHANGES = "24h,7d,30d,1y";
export const DEFAULT_ETHERS_NETWORK = "homestead";

export const DAPP_CONFIG: Config = DEV_MODE
  ? {
      multicallAddresses: {
        [ChainId.Localhost]: process.env.REACT_APP_MULTICALL_ADDRESS ?? "",
      },
      readOnlyUrls: {
        [ChainId.Localhost]: "http://127.0.0.1:8545",
      },
    }
  : { networks: [Mainnet] };
