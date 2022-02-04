import React, { useContext } from "react";
import { useTheme } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTimes } from "@fortawesome/free-solid-svg-icons";

import { AppAction, AppContext } from "../App";
import NavToggle, { NavState } from "./NavToggle";
import ScrollTop from "./ScrollTop";

const Header: React.FunctionComponent = (props): JSX.Element => {
  const appContext = useContext(AppContext);
  const theme = useTheme();

  return (
    <header>
      <NavToggle
        navState={appContext.state.navState}
        setNavState={(navState) =>
          appContext.dispatch({ type: navState === NavState.CLOSED ? AppAction.CLOSE_NAV : AppAction.OPEN_NAV })
        }
        color={theme.text}
      >
        <FontAwesomeIcon icon={appContext.state.navState === NavState.CLOSED ? faBars : faTimes} />
      </NavToggle>
      <ScrollTop />
      {props.children}
    </header>
  );
};

export default Header;
