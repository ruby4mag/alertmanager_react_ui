import { useEffect, useMemo, useState } from 'react';
import { CButtonGroup, CButton } from '@coreui/react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';

const Table = () => {
  // Load saved states from localStorage
  const initialColumnFilters = JSON.parse(localStorage.getItem('columnFilters')) || [];
  const initialGlobalFilter = localStorage.getItem('globalFilter') || '';
  const initialSorting = JSON.parse(localStorage.getItem('sorting')) || [];
  const initialPagination = JSON.parse(localStorage.getItem('pagination')) || { pageIndex: 0, pageSize: 10 };
  const initialColumnOrder = JSON.parse(localStorage.getItem('columnOrder')) || [];
  const initialColumnVisibility = JSON.parse(localStorage.getItem('columnVisibility')) || {};
  const initialDensity = localStorage.getItem('density') || 'default';
  const initialColumnSizing = JSON.parse(localStorage.getItem('columnSizing')) || {};

  // Data and fetching state
  const [data, setData] = useState([]);
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  // Table state
  const [columnFilters, setColumnFilters] = useState(initialColumnFilters);
  const [globalFilter, setGlobalFilter] = useState(initialGlobalFilter);
  const [sorting, setSorting] = useState(initialSorting);
  const [pagination, setPagination] = useState(initialPagination);
  const [columnOrder, setColumnOrder] = useState(initialColumnOrder);
  const [columnVisibility, setColumnVisibility] = useState(initialColumnVisibility);
  const [density, setDensity] = useState(initialDensity);
  const [columnSizing, setColumnSizing] = useState(initialColumnSizing);

  const fetchData = async (columnFilters, globalFilter, sorting, pagination) => {
    setIsLoading(true);

    const url = new URL(
      '/alerts',
      process.env.NODE_ENV === 'production'
        ? 'https://www.material-react-table.com'
        : 'http://192.168.1.201:8080',
    );
    url.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set('size', `${pagination.pageSize}`);
    url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
    url.searchParams.set('globalFilter', globalFilter ?? '');
    url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

    try {
      const response = await fetch(url.href);
      const json = await response.json();
      setData(json.data);
      setRowCount(json.totalRowCount);
    } catch (error) {
      setIsError(true);
      console.error(error);
    }
    setIsLoading(false);
    setIsRefetching(false);
  };

  useEffect(() => {
    fetchData(columnFilters, globalFilter, sorting, pagination);
  }, [columnFilters, globalFilter, pagination, sorting]);

  useEffect(() => {
    // Save states to localStorage
    localStorage.setItem('columnFilters', JSON.stringify(columnFilters));
    localStorage.setItem('globalFilter', globalFilter);
    localStorage.setItem('sorting', JSON.stringify(sorting));
    localStorage.setItem('pagination', JSON.stringify(pagination));
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
    localStorage.setItem('density', density);
    localStorage.setItem('columnSizing', JSON.stringify(columnSizing));
  }, [columnFilters, globalFilter, sorting, pagination, columnOrder, columnVisibility, density, columnSizing]);

  const columns = useMemo(
    () => [
      { accessorKey: 'entity', header: 'Entity' },
      { accessorKey: 'alertTime', header: 'Alert Time' },
      { accessorKey: 'alertLastTime', header: 'Latest Alert' },
      { accessorKey: 'alertClearTime', header: 'alertcleartime' },
      { accessorKey: 'alertSource', header: 'alertsource' },
      { accessorKey: 'serviceName', header: 'servicename' },
      { accessorKey: 'alertSummary', header: 'alertsummary' },
      { accessorKey: 'alertStatus', header: 'alertstatus' },
      { accessorKey: 'alertNotes', header: 'alertnotes' },
      { accessorKey: 'alertAcked', header: 'alertacked' },
      { accessorKey: 'severity', header: 'severity' },
      { accessorKey: 'alertId', header: 'alertid' },
      { accessorKey: 'alertPriority', header: 'alertpriority' },
      { accessorKey: 'ipAddress', header: 'ipaddress' },
      { accessorKey: 'alertType', header: 'alerttype' },
      { accessorKey: 'alertCount', header: 'alertcount' },
      { accessorKey: 'alertDropped', header: 'alertDropped' },

    ],
    [],
  );


  useEffect(() => {
    // Auto-refresh table data every 15 seconds
    const intervalId = setInterval(() => {
      fetchData(columnFilters, globalFilter, sorting, pagination);
    }, 15000);

    // Clear interval on component unmount
    return () => clearInterval(intervalId);
  }, [columnFilters, globalFilter, sorting, pagination]);



  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableRowSelection: true,
    getRowId: (row) => row.id,
    initialState: {
      columnVisibility,
      columnSizing,
      density,
      //showColumnFilters: true,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading data' } : undefined,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnSizingChange: setColumnSizing,
    rowCount,
    state: {
      columnFilters,
      columnOrder,
      columnSizing,
      columnVisibility,
      density,
      globalFilter,
      isLoading,
      pagination,
      showAlertBanner: isError,
      showProgressBars: isRefetching,
      sorting,
    },
    positionToolbarAlertBanner: 'bottom',
    renderTopToolbarCustomActions: ({ table }) => (
      <CButtonGroup role="group" aria-label="Basic example">
        <CButton color="primary" variant="outline"

          onClick={() => {

            alert('Create New Account');

          }}>Left</CButton>
        <CButton color="primary" variant="outline" size="sm" disabled >Middle</CButton>
        <CButton color="primary" variant="outline" size="sm">Right</CButton>
      </CButtonGroup>

    ),

  });

  return <MaterialReactTable table={table} />;
};

export default Table;
