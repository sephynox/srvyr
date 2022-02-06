import React from "react";
import { Dropdown } from "react-bootstrap";
import styled from "styled-components";
import { Currency } from "@usedapp/core";

type Props = {
  currency: Currency;
  supportedCurrencies: Record<string, Currency>;
  setCurrency: (value: Currency) => void;
};

const CurrencySelector: React.FunctionComponent<Props> = ({
  currency,
  supportedCurrencies,
  setCurrency,
}: Props): JSX.Element => {
  return (
    <DropdownButtonStyle>
      <Dropdown.Toggle variant="secondary">{currency.ticker}</Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText>{currency.name}</Dropdown.ItemText>
        <Dropdown.Divider />
        {Object.values(supportedCurrencies).map(
          (c, i) =>
            c !== currency && (
              <Dropdown.Item key={i} as="button" onClick={() => setCurrency(c)}>
                {c.name}
              </Dropdown.Item>
            )
        )}
      </Dropdown.Menu>
    </DropdownButtonStyle>
  );
};

export default CurrencySelector;

const DropdownButtonStyle = styled(Dropdown)`
  max-width: 150px;
`;
