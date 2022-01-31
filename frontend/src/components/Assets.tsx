import React from "react";
import BTable from "react-bootstrap/Table";
import { useTable, Column } from "react-table";

type Props = {
  data: Asset[];
};

export type Asset = {
  name: string;
  symbol: string;
  balance?: number;
  price?: number;
  value?: number;
};

const Assets: React.FunctionComponent<Props> = ({ data }): JSX.Element => {
  const columns: readonly Column<Asset>[] = [
    {
      Header: "Asset",
      accessor: "name",
    },
    {
      Header: "Price",
      accessor: "price",
    },
    {
      Header: "Balance",
      accessor: "balance",
    },
    {
      Header: "Value",
      accessor: "value",
    },
  ];
  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns,
    data,
  });

  // Render the UI for your table
  return (
    <BTable striped bordered hover size="sm" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th {...column.getHeaderProps()}>{column.render("Header")}</th>
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
                // eslint-disable-next-line react/jsx-key
                return <td {...cell.getCellProps()}>{cell.render("Cell")}</td>;
              })}
            </tr>
          );
        })}
      </tbody>
    </BTable>
  );
};

export default Assets;
