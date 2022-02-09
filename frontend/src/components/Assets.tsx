import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import BTable from "react-bootstrap/Table";
import { useTable, Column, HeaderGroup, ColumnInstance } from "react-table";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWallet } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

import { formatPrice } from "../utils/data-helpers";

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
