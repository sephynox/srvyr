import * as React from "react";
import { Routes as RouterRoutes, Route } from "react-router-dom";
import App from "./App";
import Dapp from "./Dapp";

import NotFound from "./routes/NotFound";
import Discover from "./routes/Discover";
import Overview from "./routes/Overview";
import Feed from "./routes/Feed";
import About from "./routes/About";

export const PAGE_OVERVIEW = "overview";
export const PAGE_FEED = "feed";
export const PAGE_ABOUT = "about";

const Routes = (): JSX.Element => (
  <RouterRoutes>
    <Route path="/" element={<App />}>
      <Route element={<Dapp />}>
        <Route index element={<Discover />} />
        <Route path={PAGE_OVERVIEW} element={<Overview />}>
          <Route path=":account" element={<Overview />} />
        </Route>
        <Route path={PAGE_FEED} element={<Feed />}></Route>
        <Route path={PAGE_ABOUT} element={<About />}></Route>
      </Route>
      <Route path="*" element={NotFound} />
    </Route>
  </RouterRoutes>
);

export default Routes;
