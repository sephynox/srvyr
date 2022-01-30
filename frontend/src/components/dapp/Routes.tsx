import * as React from "react";
import { Route } from "react-router-dom";

import Overview from "../../pages/Overview";
import NotFound from "../../pages/NotFound";

const Routes: React.FunctionComponent = (): JSX.Element => (
  <Routes>
    <Route path="/overview" element={<Overview />} />
    <Route path="/" element={<Overview />} />
    <Route element={<NotFound />} />
  </Routes>
);

export default Routes;
