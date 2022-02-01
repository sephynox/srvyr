import React from "react";
import PulseLoader from "react-spinners/PulseLoader";
import ClipLoader from "react-spinners/MoonLoader";
import BarLoader from "react-spinners/BarLoader";

type Props = {
  type?: "Pulse" | "Circle" | "Bar";
  height?: number;
  width?: number | string;
  size?: number;
  color?: string;
};

const LoaderSpinner: React.FunctionComponent<Props> = ({
  type = "Bar",
  size = 80,
  height = 80,
  width = 80,
  color = "#004085",
}: Props): JSX.Element => {
  const getSpinner = (): JSX.Element => {
    switch (type) {
      case "Pulse":
        return <PulseLoader color={color} size={size} />;
      case "Circle":
        return <ClipLoader color={color} size={size} />;
      case "Bar":
      default:
        return <BarLoader css="display: inline-block" color={color} width={width} height={height} />;
    }
  };

  return getSpinner();
};

export default LoaderSpinner;
