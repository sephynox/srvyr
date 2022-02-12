import { Dispatch, useEffect } from "react";

import { Contract, FetchState, PriceData } from "../actions/Network";
import { useIsMounted } from "../utils/custom-hooks";
import useDaemon from "../utils/daemon";

const useNoticed = (
  caller: (dispatch: Dispatch<FetchState<Record<Contract, PriceData>>>) => Promise<void>,
  dispatch: (data: FetchState<Record<Contract, PriceData>>) => void
) => {
  const isMounted = useIsMounted();
  const run = useDaemon<Record<Contract, PriceData>>("notice", () => null, dispatch);

  useEffect(() => {
    run((result) => {
      isMounted && caller(result).catch(() => null);
      return Promise.resolve();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  ///return;
};

export default useNoticed;
