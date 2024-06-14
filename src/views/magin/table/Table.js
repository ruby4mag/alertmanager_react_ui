import { useEffect, useRef, useState } from 'react';
import { Button } from '@mui/material';
import { MaterialReactTable } from 'material-react-table';
import { data } from './makeData';

//column definitions...
const columns = [
  {
    accessorKey: 'firstName',
    header: 'First Name',
  },
  {
    accessorKey: 'lastName',
    header: 'Last Name',
  },
  {
    accessorKey: 'city',
    header: 'City',
  },
  {
    accessorKey: 'state',
    header: 'State',
  },
  {
    accessorKey: 'salary',
    header: 'Salary',
  },
];
//end

const Table = () => {
  const isFirstRender = useRef(true);

  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [density, setDensity] = useState('comfortable');
  const [globalFilter, setGlobalFilter] = useState(undefined);
  const [showGlobalFilter, setShowGlobalFilter] = useState(false);
  const [columnSizing, setColumnSizing] = useState(false);
  const [columnOrder, setColumnOrder] = useState([]);
  const [showColumnFilters, setShowColumnFilters] = useState(false);
  const [sorting, setSorting] = useState([]);

  //load state from local storage
  useEffect(() => {
    const columnFilters = sessionStorage.getItem('mrt_columnFilters_table_1');
    const columnVisibility = sessionStorage.getItem(
      'mrt_columnVisibility_table_1',
    );
    const density = sessionStorage.getItem('mrt_density_table_1');
    const globalFilter = sessionStorage.getItem('mrt_globalFilter_table_1');
    const showGlobalFilter = sessionStorage.getItem(
      'mrt_showGlobalFilter_table_1',
    );
    const columnSizing = sessionStorage.getItem(
      'mrt_columnSizing_table_1',
    );
    const columnOrder = sessionStorage.getItem(
      'mrt_columnOrder_table_1',
    );
    const showColumnFilters = sessionStorage.getItem(
      'mrt_showColumnFilters_table_1',
    );
    const sorting = sessionStorage.getItem('mrt_sorting_table_1');

    if (columnFilters) {
      setColumnFilters(JSON.parse(columnFilters));
    }
    if (columnVisibility) {
      setColumnVisibility(JSON.parse(columnVisibility));
    }
    if (density) {
      setDensity(JSON.parse(density));
    }
    if (globalFilter) {
      setGlobalFilter(JSON.parse(globalFilter) || undefined);
    }
    if (showGlobalFilter) {
      setShowGlobalFilter(JSON.parse(showGlobalFilter));
    }
    if (columnSizing) {
      setColumnSizing(JSON.parse(columnSizing));
    }
    if (columnOrder) {
      setColumnOrder(JSON.parse(columnOrder));
    }
    if (showColumnFilters) {
      setShowColumnFilters(JSON.parse(showColumnFilters));
    }
    if (sorting) {
      setSorting(JSON.parse(sorting));
    }
    isFirstRender.current = false;
  }, []);

  //save states to local storage
  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_columnFilters_table_1',
      JSON.stringify(columnFilters),
    );
  }, [columnFilters]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_columnVisibility_table_1',
      JSON.stringify(columnVisibility),
    );
  }, [columnVisibility]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem('mrt_density_table_1', JSON.stringify(density));
  }, [density]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_globalFilter_table_1',
      JSON.stringify(globalFilter ?? ''),
    );
  }, [globalFilter]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_showGlobalFilter_table_1',
      JSON.stringify(showGlobalFilter),
    );
  }, [showGlobalFilter]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_columnSizing_table_1',
      JSON.stringify(columnSizing),
    );
  }, [columnSizing]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_columnOrder_table_1',
      JSON.stringify(columnOrder),
    );
  }, [columnOrder]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem(
      'mrt_showColumnFilters_table_1',
      JSON.stringify(showColumnFilters),
    );
  }, [showColumnFilters]);

  useEffect(() => {
    if (isFirstRender.current) return;
    sessionStorage.setItem('mrt_sorting_table_1', JSON.stringify(sorting));
  }, [sorting]);

  const resetState = () => {
    sessionStorage.removeItem('mrt_columnFilters_table_1');
    sessionStorage.removeItem('mrt_columnVisibility_table_1');
    sessionStorage.removeItem('mrt_density_table_1');
    sessionStorage.removeItem('mrt_globalFilter_table_1');
    sessionStorage.removeItem('mrt_showGlobalFilter_table_1');
    sessionStorage.removeItem('mrt_columnSizing_table_1');
    sessionStorage.removeItem('mrt_columnOrder_table_1');
    sessionStorage.removeItem('mrt_showColumnFilters_table_1');
    sessionStorage.removeItem('mrt_sorting_table_1');
    window.location.reload();
  };

  return (
    <MaterialReactTable
      enableColumnOrdering={true}
      enableColumnResizing={true}
      columns={columns}
      data={data}
      onColumnFiltersChange={setColumnFilters}
      onColumnVisibilityChange={setColumnVisibility}
      onDensityChange={setDensity}
      onGlobalFilterChange={setGlobalFilter}
      onShowColumnFiltersChange={setShowColumnFilters}
      onShowGlobalFilterChange={setShowGlobalFilter}
      onColumnSizingChange={setColumnSizing}
      onColumnOrderChange={setColumnOrder}
      onSortingChange={setSorting}
      state={{
        columnFilters,
        columnVisibility,
        density,
        globalFilter,
        showColumnFilters,
        showGlobalFilter,
        sorting,
        columnSizing,
        columnOrder
      }}
      renderTopToolbarCustomActions={() => (
        <Button onClick={resetState}>Reset State</Button>
      )}
    />
  );
};

export default Table;
