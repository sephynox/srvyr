import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

import { AppContext } from "../App";
import NavToggle, { NavState } from "./NavToggle";
import ScrollTop from "./ScrollTop";

const Header: React.FunctionComponent = (props): JSX.Element => {
  const appContext = useContext(AppContext);
  const theme = appContext.getTheme(appContext.theme);

  return (
    <header>
      <NavToggle navState={appContext.navState} setNavState={appContext.setNavState} color={theme.text}>
        <FontAwesomeIcon icon={appContext.navState === NavState.CLOSED ? faBars : faTimes} />
      </NavToggle>
      <ScrollTop />
      {props.children}
    </header>
  );
};

export default Header;
