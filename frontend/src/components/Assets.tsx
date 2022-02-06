import React, { useMemo } from "react";
import BTable from "react-bootstrap/Table";
import { useTranslation } from "react-i18next";
import { useTable, Column, HeaderGroup, ColumnInstance } from "react-table";
import styled from "styled-components";

type Props = {
  data: Asset[];
};

export interface Asset {
  name: string;
  ticker: string;
  contract: string;
  balance?: string;
  price?: string;
  value?: string;
  icon?: JSX.Element;
}

const Assets: React.FunctionComponent<Props> = ({ data }): JSX.Element => {
  const { t } = useTranslation();

  const headerAsset = t("asset");
  const headerPrice = t("price");
  const headerBalance = t("balance");
  const headerValue = t("value");

  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns: readonly Column<Asset>[] = useMemo(
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
      },
    ],
    [headerAsset, headerBalance, headerPrice, headerValue]
  );

  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns: memoizedColumns,
    data: memoizedData,
  });

  // Render the UI for your table
  return (
    <BTableStyle striped hover size="sm" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column: HeaderGroup<Asset> & { className?: string }) => (
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
                const col: ColumnInstance<Asset> & { className?: string } = cell.column;
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
  );
};

export default Assets;

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
