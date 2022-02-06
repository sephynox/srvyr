import React, { useMemo } from "react";
import BTable from "react-bootstrap/Table";
import { useTable, Column } from "react-table";

type Props = {
  data: Asset[];
};

export interface Asset {
  name: string;
  symbol: string;
  contract: string;
  balance?: string;
  price?: string;
  value?: string;
}

const Assets: React.FunctionComponent<Props> = ({ data }): JSX.Element => {
  const mobileCols = ["name", "balance"];
  const memoizedData = useMemo(() => data, [data]);
  const memoizedColumns: readonly Column<Asset>[] = useMemo(
    () => [
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
    ],
    []
  );

  const { getTableProps, headerGroups, rows, prepareRow } = useTable({
    columns: memoizedColumns,
    data: memoizedData,
  });

  // Render the UI for your table
  return (
    <BTable striped hover responsive size="sm" {...getTableProps()}>
      <thead>
        {headerGroups.map((headerGroup) => (
          // eslint-disable-next-line react/jsx-key
          <tr {...headerGroup.getHeaderGroupProps()}>
            {headerGroup.headers.map((column) => (
              // eslint-disable-next-line react/jsx-key
              <th
                {...column.getHeaderProps()}
                className={!mobileCols.includes(column.id) ? "d-none d-sm-none d-md-table-cell" : ""}
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
                return (
                  // eslint-disable-next-line react/jsx-key
                  <td
                    {...cell.getCellProps()}
                    className={!mobileCols.includes(cell.column.id) ? "d-none d-sm-none d-md-table-cell" : ""}
                  >
                    {cell.render("Cell")}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </tbody>
    </BTable>
  );
};

export default Assets;
