import { useEffect, useMemo, useState, useRef } from 'react';
import { CButtonGroup, CButton } from '@coreui/react';
import { cilWarning } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import 'react-sliding-pane/dist/react-sliding-pane.css';

import { Link } from 'react-router-dom';
import useAxios from '../../services/useAxios';
import './styles.css'; // Import your custom CSS

const DataTable = () => {
  // Sliding Pane
  const [state, setState] = useState({
    isPaneOpen: false,
    isPaneOpenLeft: false,
  });
  const [theme, setTheme] = useState(localStorage.getItem('coreui-free-react-admin-template-theme') || 'dark');
  const [sliderdata, setSliderdata] = useState({})
  const api = useAxios();
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
      '/api/alerts',
      process.env.NODE_ENV === 'production'
        ? 'http://192.168.1.201:8080'
        : 'http://192.168.1.201:8080',
    );
    url.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set('size', `${pagination.pageSize}`);
    url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
    url.searchParams.set('globalFilter', globalFilter ?? '');
    url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

    try {
      const response = await api.get(url.href);
      const json = response.data;
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
  }, [columnFilters, globalFilter, sorting, pagination, columnOrder, columnVisibility, density, columnSizing]);

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
      {
        accessorKey: 'entity', header: 'Entity', Cell: ({ cell }) => (
          <Link className="link" to={`/alert/details/${cell.row.original.ID}`}>
            {cell.getValue()}
          </Link>
        ),
      },
      { accessorKey: 'alertTime', header: 'Alert Time' },
      { accessorKey: 'alertLastTime', header: 'Latest Alert' },
      { accessorKey: 'alertClearTime', header: 'alertcleartime' },
      { accessorKey: 'alertSource', header: 'alertsource' },
      { accessorKey: 'serviceName', header: 'servicename' },
      { accessorKey: 'alertSummary', header: 'alertsummary' },
      { accessorKey: 'alertStatus', header: 'alertstatus' },
      { accessorKey: 'alertNotes', header: 'alertnotes' },
      { accessorKey: 'alertAcked', header: 'alertacked' },
      {
        accessorKey: 'severity', header: 'severity', Cell: ({ cell }) => (
          cell.getValue() == "WARNING" ? <CIcon icon={cilWarning} className="me-2 text-warning" size="lg" /> : <CIcon icon={cilWarning} className="me-2 text-danger" size="lg" />
        ),
      },
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
    enableStickyHeader: true,
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

  if (state.isPaneOpen) {
    const elements = document.querySelectorAll(".MuiPaper-root");
    elements.forEach(element => {
      element.style.display = 'none';
    });
  } else {
    const elements = document.querySelectorAll(".MuiPaper-root");
    elements.forEach(element => {
      element.style.display = 'block';
    });
  }

  const hideElementsByClass = (className) => {
    const elements = document.querySelectorAll(`.${MuiBox - root}`);
    elements.forEach(element => {
      element.style.visible = 'hidden';
    });
  };

  return (
    <>
      <div className={theme == 'light' ? "" : "dark-theme"}>
        <MaterialReactTable table={table} />
      </div>
    </>
  )

};

export default DataTable;
