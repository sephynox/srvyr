import React, { useCallback, useEffect, useRef, useState } from "react";

type Props = {
  name: string;
  color?: "black" | "color" | "white";
};

const CryptoIcon: React.FunctionComponent<Props> = ({ name, color = "color" }): JSX.Element => {
  const [icon, setIcon] = useState("");
  const isActive = useRef(true);

  const fetchIcon = useCallback(async () => {
    const importedIcon = await import(
      `/node_modules/cryptocurrency-icons/svg/${color}/${name.toLowerCase()}.svg`
    ).catch(async () => {
      return await import(`/node_modules/cryptocurrency-icons/svg/${color}/generic.svg`);
    });
    isActive.current && setIcon(importedIcon.default);
  }, [color, name]);

  useEffect(() => {
    fetchIcon();

    return () => {
      isActive.current = false;
    };
  }, [fetchIcon]);

  return <img alt={name.toUpperCase()} src={icon} />;
};

export default CryptoIcon;
