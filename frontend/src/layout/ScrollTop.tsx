import { useEffect } from "react";
import { createBrowserHistory } from "history";

const ScrollTop = () => {
  const history = createBrowserHistory();

  useEffect(() => {
    const listener = history.listen(() => {
      document.body.scrollTo(0, 0);
    });

    return () => {
      listener();
    };
  }, [history]);

  return null;
};

export default ScrollTop;
