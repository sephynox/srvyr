import { Dispatch, useEffect } from "react";

import { Contract, FetchState, PriceData } from "../actions/Network";
import { useIsMounted } from "../utils/custom-hooks";
import useDaemon from "../utils/daemon";

const DEFAULT_REFRESH_INTERVAL = 500000;

const usePriced = (
  caller: (dispatch: Dispatch<FetchState<Record<Contract, PriceData>>>) => Promise<void>,
  dispatch: (data: FetchState<Record<Contract, PriceData>>) => void,
  frequency = DEFAULT_REFRESH_INTERVAL
): NodeJS.Timer => {
  const isMounted = useIsMounted();
  const run = useDaemon<Record<Contract, PriceData>>("price", () => null, dispatch);

  const interval = setInterval(() => {
    run(caller);
  }, frequency);

  useEffect(() => {
    run((result) => {
      isMounted && caller(result).catch(() => null);
      return Promise.resolve();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return interval;
};

export default usePriced;
