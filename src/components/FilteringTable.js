import { useMemo } from 'react';
import { useTable, useSortBy, useGlobalFilter } from 'react-table';
import MOCK_DATA from './MOCK_DATA.json';
import { COLUMNS } from './columns';
import './table.css';
import { GlobalFilter } from './GlobalFilter';

export const FilteringTable = () => {
    const columns = useMemo(() => COLUMNS, []);
    const data = useMemo(() => MOCK_DATA, []);

    const {
        getTableProps,
        getTableBodyProps,
        headerGroups,
        footerGroups,
        rows,
        state,
        setGlobalFilter,
        prepareRow
    } = useTable(
        {
            columns,
            data
        },
        useGlobalFilter,
        useSortBy
    );

    const { globalFilter } = state;

    return (
        <div className="table-container">
            <GlobalFilter 
                globalFilter={globalFilter} 
                setGlobalFilter={setGlobalFilter} 
            />
            <table {...getTableProps()}>
                <thead>
                    {headerGroups.map((headerGroup, index) => (
                        <tr {...headerGroup.getHeaderGroupProps()} key={index}>
                            {headerGroup.headers.map(column => (
                                <th {...column.getHeaderProps(column.getSortByToggleProps())} key={column.id}>
                                    {column.render('Header')}
                                    <span>
                                        {column.isSorted
                                            ? column.isSortedDesc
                                                ? ' 🔽'
                                                : ' 🔼'
                                            : ''}
                                    </span>
                                </th>
                            ))}
                        </tr>
                    ))}
                </thead>
                <tbody {...getTableBodyProps()}>
                    {rows.map((row, index) => {
                        prepareRow(row);
                        return (
                            <tr {...row.getRowProps()} key={index}>
                                {row.cells.map(cell => (
                                    <td {...cell.getCellProps()} key={cell.column.id}>
                                        {cell.render('Cell')}
                                    </td>
                                ))}
                            </tr>
                        );
                    })}
                </tbody>
                <tfoot>
                    {footerGroups.map((footerGroup, index) => (
                        <tr {...footerGroup.getFooterGroupProps()} key={index}>
                            {footerGroup.headers.map(column => (
                                <td {...column.getFooterProps()} key={column.id}>
                                    {column.render('Footer')}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tfoot>
            </table>
        </div>
    );
};

export default FilteringTable;