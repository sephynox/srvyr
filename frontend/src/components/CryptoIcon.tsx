import React, { useCallback, useEffect, useState } from "react";

type Props = {
  name: string;
  color?: "black" | "color" | "white";
};

const CryptoIcon: React.FunctionComponent<Props> = ({ name, color = "color" }): JSX.Element => {
  const [icon, setIcon] = useState("");

  const fetchIcon = useCallback(async () => {
    const importedIcon = await import(`cryptocurrency-icons/svg/${color}/${name.toLowerCase()}/.svg`);
    setIcon(importedIcon.default);
  }, [color, name]);

  useEffect(() => {
    fetchIcon();
  }, [fetchIcon]);

  return <img alt={name.toUpperCase()} src={icon} />;
};

export default CryptoIcon;
