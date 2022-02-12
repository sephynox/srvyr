import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import BTable from "react-bootstrap/Table";
import { useTable, Column, HeaderGroup, ColumnInstance } from "react-table";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowsAlt, faInbox, faPaperPlane, faWallet, IconDefinition } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

import { ThemeEngine } from "../styles/GlobalStyle";
import { datedRecordFromArray, formatPrice, shortDisplayAddress, shortTransactionHash } from "../utils/data-helpers";
import { Blockie, BlockieState } from "./Blockies";

type Props = {
  data: AssetTableData[];
  currency: string;
  total: number;
};

export interface AssetTableData {
  name: string;
  ticker: string;
  contract: string;
  balance?: string;
  price?: string;
  value?: string;
  icon?: JSX.Element;
}

export interface AssetPieData {
  name: string;
  value: number;
}

export const AssetsTable: React.FunctionComponent<Props> = ({ data, currency, total }): JSX.Element => {
  const { t, i18n } = useTranslation();

  const headerAsset = t("asset");
  const headerPrice = t("price");
  const headerBalance = t("balance");
  const headerValue = t("value");

  const formatCurrency = useCallback(
    (moneyValue: string | number | undefined) => {
      return moneyValue ? formatPrice(Number(moneyValue), 8, i18n.language, currency) : "N/A";
    },
    [currency, i18n.language]
  );

  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns: readonly Column<AssetTableData>[] = useMemo(
    () => [
      {
        Header: "",
        accessor: "icon",
        className: "compact",
      },
      {
        Header: headerAsset,
        accessor: "name",
      },
      {
        Header: headerPrice,
        accessor: "price",
        className: "right d-none d-sm-none d-md-table-cell",
        Cell: ({ row, cell }) => formatCurrency(cell.value),
      },
      {
        Header: headerBalance,
        accessor: "balance",
        className: "right",
      },
      {
        Header: headerValue,
        accessor: "value",
        className: "right d-none d-sm-none d-md-table-cell",
        Cell: ({ row, cell }) =>
          row.cells[2].value && row.cells[3].value ? formatCurrency(row.cells[2].value * row.cells[3].value) : "N/A",
      },
    ],
    [headerAsset, headerBalance, headerPrice, headerValue, formatCurrency]
  );

  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns: memoizedColumns,
    data: memoizedData,
  });

  // Render the UI for your table
  return (
    <>
      <HeaderStyle>
        <FontAwesomeIcon icon={faWallet} /> {` ${t("wallet")}: ${formatCurrency(total)}`}
      </HeaderStyle>
      <BTableStyle striped hover size="sm" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup) => (
            // eslint-disable-next-line react/jsx-key
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column: HeaderGroup<AssetTableData> & { className?: string }) => (
                // eslint-disable-next-line react/jsx-key
                <th
                  {...column.getHeaderProps([
                    {
                      className: column.className,
                    },
                  ])}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {rows.map((row, i) => {
            prepareRow(row);
            return (
              // eslint-disable-next-line react/jsx-key
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  const col: ColumnInstance<AssetTableData> & { className?: string } = cell.column;
                  return (
                    // eslint-disable-next-line react/jsx-key
                    <td {...cell.getCellProps([{ className: col.className }])}>{cell.render("Cell")}</td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </BTableStyle>
    </>
  );
};

export interface TransactionTableData {
  timestamp: number;
  type: string;
  from: string;
  to: string;
  hash: string;
  data: string;
  fee?: string;
  extras?: Record<string, string>;
}

type TransactionTableProps = {
  address: string;
  addressPath: string;
  transactionPath: string;
  data: TransactionTableData[];
  limit?: number;
};

const icons: Record<string, IconDefinition> = {
  send: faPaperPlane,
  receive: faInbox,
  contract: faArrowsAlt,
};

export const TransactionsTable: React.FunctionComponent<TransactionTableProps> = ({
  address,
  addressPath,
  transactionPath,
  data,
  limit = 100,
}): JSX.Element => {
  const { t, i18n } = useTranslation();
  const records = datedRecordFromArray(data);

  const getBlockieAddress = (addr: string, uri?: string) => (
    <address>
      <Blockie skeleton={<></>} state={BlockieState.SUCCESS} address={addr} />
      {uri ? <a href={uri.replace("{}", addr)}>{shortDisplayAddress(addr)}</a> : shortDisplayAddress(addr)}
    </address>
  );

  const buildRow = (index: number, record: TransactionTableData): JSX.Element => {
    const time = Intl.DateTimeFormat(i18n.language, {
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).format(new Date(record.timestamp));

    let icon: IconDefinition = icons.contract;
    let type = "send";
    let title: string = t("contract");

    if (record.from === address) {
      icon = icons.send;
      type = "send";
      title = t("send");
    } else if (record.to === address) {
      icon = icons.receive;
      type = "receive";
      title = t("receive");
    }

    return (
      <TransactionRowStyle key={index}>
        <div>
          <figure>
            <FontAwesomeIcon icon={icon} />
            <figcaption>
              <strong>{title}</strong>
              <em>{time}</em>
            </figcaption>
          </figure>
          <section className="d-none d-sm-none d-md-block"></section>
          <section>
            <em>{t(type === "send" ? "to" : "from")}</em>
            {getBlockieAddress(type === "send" ? record.to : record.from, addressPath)}
          </section>
        </div>
        <details>
          <summary>{t("details")}</summary>
          <div>
            <section>
              <em>Tx Hash</em>
              <a href={transactionPath.replace("{}", record.hash)} target="_blank" rel="noreferrer">
                {shortTransactionHash(record.hash)}
              </a>
            </section>
            {record.fee && (
              <section>
                <em>{t("fee")}</em>
                <span>{record.fee}</span>
              </section>
            )}
            {record.extras &&
              Object.keys(record.extras).map((key, index) => (
                <section key={index}>
                  <em>{t(key)}</em>
                  <span>{record.extras ? record.extras[key] : "N/A"}</span>
                </section>
              ))}
          </div>
        </details>
        <hr />
      </TransactionRowStyle>
    );
  };

  const buildGroup = (index: number, date: number, records: TransactionTableData[]): JSX.Element => {
    return (
      <TransactionDateBlockStyle key={index}>
        <h4>{Intl.DateTimeFormat(i18n.language).format(new Date(date))}</h4>
        <hr />
        {records.map((record, i) => buildRow(i, record))}
      </TransactionDateBlockStyle>
    );
  };

  return (
    <>
      <h3>{t("history")}</h3>
      {Object.keys(records).map((d, i) => buildGroup(i, parseInt(d), records[parseInt(d)]))}
    </>
  );
};

type AssetsPieProps = {
  height: number;
  width: number;
  data: AssetPieData[];
  outerRadius?: number;
  innerRadius?: number;
};

export const AssetsPie: React.FunctionComponent<AssetsPieProps> = ({
  height,
  width,
  data,
  outerRadius = 40,
  innerRadius = 30,
}): JSX.Element => {
  const COLORS = ["#789af5", "#f5cd78", "#f58f78", "#b3b3b3"];

  return (
    <PieChart width={width + 100} height={height}>
      <Pie
        data={data}
        cx={width / 2}
        cy={height / 2}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        fill="#8884d8"
        paddingAngle={5}
        dataKey="value"
      >
        {data.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
        ))}
      </Pie>
      <Legend verticalAlign="middle" align="right" layout="vertical" />
    </PieChart>
  );
};

const TransactionDateBlockStyle = styled.section`
  & h4 {
    margin-top: 3rem;
  }
`;

const TransactionRowStyle = styled.article`
  & div,
  details > div {
    display: flex;
    flex-wrap: wrap;
    flex-direction: row;
    align-items: center;
    justify-content: flex-start;

    *:nth-child(3) {
      margin-left: 0;
    }

    *:nth-child(4) {
      margin-left: 45px;
    }
  }

  & details {
    margin-left: 65px;

    & div {
      margin-left: 0 !important;

      & section {
        max-width: 33%;
        margin-left: 0 !important;
      }

      & span {
        display: block;
        overflow: hidden;
        text-overflow: ellipsis;
      }
    }

    & summary {
      padding-bottom: 10px;
    }
  }

  & div,
  hr {
    margin-left: 20px;
  }

  & figure {
    display: flex;
    flex-direction: row;
    padding: 0.5rem;

    & svg {
      width: 40px !important;
      height: 40px !important;
      padding-right: 20px;
    }

    & figcaption {
      display: flex;
      flex-direction: column;
    }
  }

  section > em {
    color: ${(props: ThemeEngine) => props.theme.textSubdued};
  }

  & section {
    display: flex;
    flex-direction: column;

    & img {
      width: 16px;
      margin-right: 10px;
      border-radius: 4px;
      display: inline-block;
    }
  }

  & figure,
  section {
    text-align: left;
    flex: 0 0 33.333333%;
  }

  @media screen and (max-width: 768px) {
    & figure,
    section {
      flex: 0 0 33.333333%;
    }

    *:nth-child(3) {
      margin-left: 45px;
    }

    *:nth-child(4) {
      margin-left: 0;
    }
  }
`;

const HeaderStyle = styled.h3`
  padding-bottom: 20px;
`;

const BTableStyle = styled(BTable)`
  table-layout: fixed;

  & td {
    max-width: 100%;
    padding-bottom: 15px;
    padding-top: 15px;

    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    vertical-align: middle;
  }

  & .right {
    text-align: right;
  }

  & .compact {
    width: 50px;
    white-space: nowrap;
    padding-right: 10px;
  }
`;
