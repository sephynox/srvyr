import { Mainnet, Config, ChainId, Localhost } from "@usedapp/core";
//import WalletConnectProvider from "@walletconnect/web3-provider";

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
      autoConnect: false,
      networks: [Localhost],
      readOnlyChainId: Mainnet.chainId,
      readOnlyUrls: {
        [ChainId.Mainnet]: `https://mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`,
      },
      multicallAddresses: {
        [ChainId.Localhost]: `${process.env.REACT_APP_MULTICALL_ADDRESS}`,
        [ChainId.Mainnet]: `${process.env.REACT_APP_MAINNET_MULTICALL_ADDRESS}`,
      },
    }
  : { autoConnect: false, networks: [Mainnet] };

// export const WC_CONFIG = {
//   injected: {
//     display: {
//       name: "Metamask",
//       description: "Connect with the provider in your Browser",
//     },
//     package: null,
//   },
//   walletconnect: {
//     package: WalletConnectProvider,
//     options: {
//       bridge: "https://bridge.walletconnect.org",
//       infuraId: `${process.env.REACT_APP_INFURA_PROJECT_ID}`,
//     },
//   },
// };
