import * as React from "react";
import { Route } from "react-router-dom";

import Main from "./Main";
import NotFound from "../pages/NotFound";

const Routes: React.FunctionComponent = (): JSX.Element => (
  <Routes>
    <Route path="/" element={<Main />} />
    <Route element={<NotFound />} />
  </Routes>
);

export default Routes;
