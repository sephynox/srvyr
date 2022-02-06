import * as React from "react";
import { Link } from "react-router-dom";

import { availableThemes, Themes } from "../styles/Themes";

type Props = {
  mode: Themes;
};

const Logo: React.FunctionComponent<Props> = ({ mode }: Props): JSX.Element => {
  return (
    <Link to="/">
      <img id="logo" src={availableThemes[mode].images.logo} alt="SRVYR" />
    </Link>
  );
};

export default Logo;
