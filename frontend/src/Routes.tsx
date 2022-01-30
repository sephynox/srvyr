import * as React from "react";
import { Route } from "react-router-dom";

import Home from "./pages/Home";
import NotFound from "./pages/NotFound";

const Routes: React.FunctionComponent = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route element={<NotFound />} />
  </Routes>
);

export default Routes;
