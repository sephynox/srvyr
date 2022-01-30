import React from "react";
import styled from "styled-components";
import { Dropdown } from "react-bootstrap";

import { supportedLanguages, systemLanguages } from "../Data";

type Props = {
  language: string;
  setLanguage: (value: string) => void;
};

const LanguageSelector: React.FunctionComponent<Props> = ({ language, setLanguage }: Props): JSX.Element => {
  return (
    <DropdownButtonStyle>
      <Dropdown.Toggle variant="secondary">{language}</Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText>{systemLanguages[language]}</Dropdown.ItemText>
        <Dropdown.Divider />
        {supportedLanguages.map(
          (l, i) =>
            l !== language && (
              <Dropdown.Item key={i} as="button" onClick={() => setLanguage(l)}>
                {systemLanguages[l]}
              </Dropdown.Item>
            )
        )}
      </Dropdown.Menu>
    </DropdownButtonStyle>
  );
};

export default LanguageSelector;

const DropdownButtonStyle = styled(Dropdown)`
  max-width: 150px;
`;
