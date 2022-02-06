import React from "react";
import { Dropdown } from "react-bootstrap";
import styled from "styled-components";

type Props = {
  language: string;
  supportedLangs: Record<string, string>;
  setLanguage: (value: string) => void;
};

const LanguageSelector: React.FunctionComponent<Props> = ({
  language,
  supportedLangs,
  setLanguage,
}: Props): JSX.Element => {
  return (
    <DropdownButtonStyle>
      <Dropdown.Toggle variant="secondary">{language}</Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText>{supportedLangs[language]}</Dropdown.ItemText>
        <Dropdown.Divider />
        {Object.keys(supportedLangs).map(
          (l, i) =>
            l !== language && (
              <Dropdown.Item key={i} as="button" onClick={() => setLanguage(l)}>
                {supportedLangs[l]}
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
