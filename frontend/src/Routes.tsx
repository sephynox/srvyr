import * as React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import App from "./App";
import Dapp from "./Dapp";

import NotFound from "./routes/NotFound";
import Discover from "./routes/Discover";
import Overview from "./routes/Overview";

export const PAGE_OVERVIEW = "overview";

const Routes = (): JSX.Element => (
  <RouterRoutes>
    <Route path="/" element={<App />}>
      <Route element={<Dapp />}>
        <Route index element={<Discover />} />
        <Route path={PAGE_OVERVIEW} element={<Overview />}>
          <Route path=":account" element={<Overview />} />
        </Route>
      </Route>
      <Route path="*" element={NotFound} />
    </Route>
  </RouterRoutes>
);

export default Routes;
