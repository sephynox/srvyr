import { Dispatch, useCallback, useEffect, useMemo, useState } from "react";

import { FetchState } from "../actions/Network";
import { useIsMounted } from "./custom-hooks";

export enum DaemonEvent {
  BOOT = "BOOT",
  LISTENING = "LISTENING",
  SYN = "SYN",
  ERROR = "ERROR",
}

type DaemonEvents<T> =
  | { type: DaemonEvent.BOOT }
  | { type: DaemonEvent.LISTENING }
  | { type: DaemonEvent.ERROR; message?: string }
  | { type: DaemonEvent.SYN; status: string; data: FetchState<T> };

const useDaemon = <T,>(
  name: string,
  boot: () => void,
  dispatch: (data: FetchState<T>) => void
): ((exec: (dispatch: Dispatch<FetchState<T>>) => Promise<void>) => void) => {
  const initd: DaemonEvents<T> = useMemo(() => Object({ type: DaemonEvent.LISTENING }), []);
  const serviceName = `service-${name}-d`;

  const isMounted = useIsMounted();
  const [stated, setStated] = useState<DaemonEvents<T>>({ type: DaemonEvent.BOOT });

  // Visual daemons for debugging
  const appendElement = useCallback(
    (event: DaemonEvents<T>) => {
      if (process.env.NODE_ENV === "production") {
        return;
      } else {
        let element = document.getElementById(serviceName);

        if (!element) {
          element = document.createElement("span");
          element.id = serviceName;

          document.getElementById("root")?.appendChild(element);
        }

        element.setAttribute("hidden", "true");

        switch (event.type) {
          case DaemonEvent.BOOT:
            element.innerHTML = "READY";
            return;
          case DaemonEvent.LISTENING:
            element.innerHTML = DaemonEvent.LISTENING;
            return;
          case DaemonEvent.SYN:
            element.innerHTML = `SYN: ${event.status}`;
            return;
          case DaemonEvent.ERROR:
            element.innerHTML = `DAEMON FAILURE: ${event.message}`;
            element.className = "daemon-fault";
            element.setAttribute("hidden", "false");
            return;
        }
      }
    },
    [serviceName]
  );

  const listenEventBus = useCallback(async () => {
    appendElement(stated);
    switch (stated.type) {
      case DaemonEvent.SYN:
        isMounted && dispatch(stated.data);
        return setStated(initd);
      case DaemonEvent.BOOT:
        isMounted && boot();
        return setStated(initd);
      case DaemonEvent.ERROR:
      case DaemonEvent.LISTENING:
      default:
        return;
    }
  }, [stated, isMounted, initd, dispatch, boot, appendElement]);

  useEffect(() => {
    listenEventBus();
  }, [listenEventBus]);

  return async (exec: (dispatch: Dispatch<FetchState<T>>) => Promise<void>) => {
    await exec((result) => {
      setStated({ type: DaemonEvent.SYN, status: result.type.toString(), data: result });
    }).catch((e) => {
      setStated({ type: DaemonEvent.ERROR, message: e.message });
    });
  };
};

export default useDaemon;
