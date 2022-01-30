import React from "react";
import styled from "styled-components";

type Props = {
  title: string;
  links: SocialBlock[];
  hoverTextColor: string;
  url?: string;
};

export type SocialBlock = {
  title: string;
  icon: string;
  url: string;
};

export const SocialLink = ({ title, icon, url }: SocialBlock): JSX.Element => (
  <SocialLinkStyle href={url} target="_blank" title={title}>
    <i className={icon}></i>
  </SocialLinkStyle>
);

const SocialLinks: React.FunctionComponent<Props> = (props): JSX.Element => {
  props = { url: props.url ?? window.location.href, ...props };

  const links = props.links.map(
    (l: SocialBlock, i): JSX.Element => <SocialLink key={i} {...{ ...l, url: l.url + props.url }} />
  );

  return <>{links}</>;
};

export default SocialLinks;

const SocialLinkStyle = styled.a`
  font-size: 24px;
  display: inline-block;
  line-height: 1;
  transition: 0.3s;

  :not(:last-child) {
    margin-right: 20px;
  }

  &:hover {
    color: ${(props: Props) => props.hoverTextColor};
  }
`;
