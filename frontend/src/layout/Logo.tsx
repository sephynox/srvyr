import * as React from "react";

import { availableThemes, Themes } from "../tools/Themes";

type Props = {
  mode: Themes;
};

const Logo: React.FunctionComponent<Props> = ({ mode }: Props): JSX.Element => {
  return <img id="logo" src={availableThemes[mode].images.logo} alt="SRVYR" />;
};

export default Logo;
