import React, { useEffect, useState } from "react";
import styled from "styled-components";

interface BackTopProps {
  textColor: string;
  backgroundColor: string;
}

const BackTop = (props: BackTopProps): JSX.Element => {
  const [visible, setVisible] = useState(false);

  const toggleVisible = () => {
    const scrollTop = document.body.scrollTop;

    if (scrollTop > 300) {
      setVisible(true);
    } else if (scrollTop <= 300) {
      setVisible(false);
    }
  };

  const scrollToTop = () => {
    document.body.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    window.addEventListener("scroll", toggleVisible, { capture: true });
  }, []);

  return (
    <BackTopStyle
      className="icon bi-arrow-bar-up"
      onClick={scrollToTop}
      {...props}
      style={{ display: visible ? "block" : "none" }}
    ></BackTopStyle>
  );
};

export default BackTop;

const BackTopStyle = styled.div`
  position: fixed;
  height: 56px;
  width: 56px;
  right: 40px;
  border-radius: 50px;
  bottom: 100px;
  padding: 5px 12px;
  align-items: center;
  font-size: 30px;
  color: ${(props: BackTopProps) => props.textColor};
  background-color: ${(props: BackTopProps) => props.backgroundColor};
  transition: 0.5s all ease-in-out;
  overflow: hidden;
  z-index: 1;
  opacity: 0.75;
  cursor: pointer;

  &:hover {
    background-color: rgb(5, 99, 187);
  }

  @media screen and (max-width: 768px) {
    bottom: 80px;
    right: 15px;
    opacity: 0.5;
  }
`;
