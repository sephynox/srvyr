import React from "react";
import Skeleton from "react-loading-skeleton";
import styled, { useTheme } from "styled-components";

import Theme from "../styles/Themes";
import { randomNumber } from "../utils/data-helpers";

type Props = {
  type?: "Profile" | "Bars" | "Paragraphs";
  height?: number | string;
  width?: number | string;
  thickness?: number | string;
  bars?: number;
  key?: number | string;
};

export const SkeletonProfile: React.FunctionComponent<Props> = (props): JSX.Element => (
  <SkeletonContainerStyle>
    <LoaderSkeleton type="Profile" {...props} />
  </SkeletonContainerStyle>
);

const LoaderSkeleton: React.FunctionComponent<Props> = ({
  type = "Profile",
  height = 80,
  width = 80,
  thickness = 16,
  bars = 1,
}: Props): JSX.Element => {
  const theme: Theme = useTheme();
  const baseColor = theme.loaderBase;
  const highlightColor = theme.loaderHightlight;

  switch (type) {
    default:
    case "Profile":
      return (
        <>
          <Skeleton circle width={width} height={height} baseColor={baseColor} highlightColor={highlightColor} />
          <Skeleton count={1} width={width} baseColor={baseColor} highlightColor={highlightColor} />
        </>
      );
    case "Bars":
      return (
        <>
          {[...Array(bars)].map((v, i) => (
            <Skeleton
              key={i}
              count={1}
              width={`calc(${width} - ${randomNumber(1, 10)}em)`}
              height={thickness}
              baseColor={baseColor}
              highlightColor={highlightColor}
            />
          ))}
        </>
      );
    case "Paragraphs":
      return (
        <>
          {Array.from(Array(bars), (e, i) => {
            return i % randomNumber(1, bars) === 0 ? (
              <br key={i} />
            ) : (
              <Skeleton
                key={i}
                count={1}
                width={`calc(${width} - ${randomNumber(1, 10)}em)`}
                baseColor={baseColor}
                highlightColor={highlightColor}
              />
            );
          })}
        </>
      );
  }
};

export default LoaderSkeleton;

const SkeletonContainerStyle = styled.div`
  text-align: center;
`;
