import React from "react";
import styled from "styled-components";

type Props = {
  quote: string;
  borderColor: string;
  textColor: string;
  author?: string;
  authorColor?: string;
};

export const Blockquote = styled.blockquote`
  margin-top: 20px;
  margin-bottom: 20px;
  padding-left: 10px;
  border-left: 1px solid ${(props: Props) => props.borderColor};
  font-size: 1.2em;
  color: ${(props: Props) => props.textColor};

  & em {
    margin-top: 10px;
    margin-bottom: 10px;
    color: ${(props: Props) => props.authorColor ?? props.textColor};
  }

  @media screen and (max-width: 768px) {
    & em {
      text-align: right;
    }
  }
`;

const Quote = ({ quote, author, borderColor, textColor, authorColor }: Props): JSX.Element => {
  return (
    <Blockquote borderColor={borderColor} textColor={textColor} authorColor={authorColor}>
      <cite>&ldquo;{quote}&rdquo;</cite>
      {author && (
        <>
          <br />
          <em>- {author}</em>
        </>
      )}
    </Blockquote>
  );
};

export default Quote;
