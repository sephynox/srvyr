
import { Mainnet, Config, ChainId } from "@usedapp/core";

export const DEV_MODE = "production" !== process.env.NODE_ENV;
const CONFIG: Config = DEV_MODE
  ? {
      multicallAddresses: {
        [ChainId.Localhost]: process.env.REACT_APP_MULTICALL_ADDRESS ?? "",
      },
      readOnlyUrls: {
        [ChainId.Localhost]: "http://127.0.0.1:8545",
      },
    }
  : { networks: [Mainnet] };
export default CONFIG;

