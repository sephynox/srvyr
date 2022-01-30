import React from "react";

import ScrollTop from "./ScrollTop";
import { NavToggle } from "./Navigation";

const Header: React.FunctionComponent = (props): JSX.Element => {
  return (
    <header>
      <NavToggle />
      <ScrollTop />
      {props.children}
    </header>
  );
};

export default Header;
