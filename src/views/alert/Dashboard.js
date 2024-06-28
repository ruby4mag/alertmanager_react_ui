import { useEffect, useMemo, useState, useRef } from 'react';
import { CButtonGroup, CButton, CBadge, CContainer } from '@coreui/react';
import { cilWarning } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import 'react-sliding-pane/dist/react-sliding-pane.css';

import { Link } from 'react-router-dom';
import useAxios from '../../services/useAxios';
import './styles.css'; // Import your custom CSS
var initial = true;
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
  const initialDensity = localStorage.getItem('density') || 'compact';
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
    console.log("In fetch", JSON.stringify(pagination))
    console.log("In fetch Row Count", rowCount)

    if (!data.length) {

      setIsLoading(true);

    } else {

      setIsRefetching(true);

    }

    const url = new URL(
      '/api/alerts',
      process.env.NODE_ENV === 'production'
        ? 'http://192.168.1.201:8080'
        : 'http://192.168.1.201:8080',
    );
    console.log(pagination.pageIndex)
    url.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set('size', `${pagination.pageSize}`);
    url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
    url.searchParams.set('globalFilter', globalFilter ?? '');
    url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

    try {
      const response = await api.get(url.href);
      const json = await response.data;

      setData(json.data);
      setRowCount(json.totalRowCount);
      console.log("After fetch Row Count", rowCount, json.totalRowCount)

    } catch (error) {
      setIsError(true);
      console.error(error);
    }
    setIsError(false);

    setIsLoading(false);

    setIsRefetching(false);

  };
  useEffect(() => {
    console.log("Initial Fetch")
    fetchData(columnFilters, globalFilter, sorting, pagination)
  }, [pagination])


  useEffect(() => {

    console.log("Change Fetch")
    console.log("In One" + JSON.stringify(pagination))
    localStorage.setItem('columnFilters', JSON.stringify(columnFilters));
    localStorage.setItem('globalFilter', globalFilter);
    localStorage.setItem('sorting', JSON.stringify(sorting));
    localStorage.setItem('pagination', JSON.stringify(pagination));
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
    localStorage.setItem('density', density);
    localStorage.setItem('columnSizing', JSON.stringify(columnSizing));
    fetchData(columnFilters, globalFilter, sorting, pagination);
  }, [columnFilters, globalFilter, sorting, pagination, columnOrder, columnVisibility, density, columnSizing]);

  // useEffect(() => {
  //   console.log("In Two")

  //   // Save states to localStorage

  // }, [columnFilters, globalFilter, sorting, pagination, columnOrder, columnVisibility, density, columnSizing]);

  const columns = useMemo(
    () => [
      {
        accessorKey: 'entity', header: 'Entity', Cell: ({ cell }) => (
          <Link className="link" to={`/alert/details/${cell.row.original.ID}`} >
            {cell.row.original.groupalerts && (cell.row.original.groupalerts).length > 0 ?
              <div><span className="badge text-bg-warning" style={{ marginRight: '5px' }}>{cell.row.original.groupalerts.length}</span>{cell.getValue()}</div>
              : cell.getValue()}
          </Link>
        ),
      },
      { accessorKey: 'alertfirsttime', header: 'Alert Time' },
      { accessorKey: 'alertlasttime', header: 'Latest Alert' },
      { accessorKey: 'alertcleartime', header: 'alertcleartime' },
      { accessorKey: 'alertsource', header: 'alertsource' },
      { accessorKey: 'servicename', header: 'servicename' },
      { accessorKey: 'alertsummary', header: 'alertsummary' },
      {
        accessorKey: 'alertstatus', header: 'alertstatus', Cell: ({ cell }) => (
          cell.getValue() == "OPEN" ? <span className="badge text-bg-warning">{cell.getValue()}</span> : <span className="badge text-bg-success">New</span>
        ),
      },
      { accessorKey: 'alertnotes', header: 'alertnotes' },
      { accessorKey: 'alertacked', header: 'alertacked' },
      {
        accessorKey: 'severity', header: 'severity', Cell: ({ cell }) => (
          cell.getValue() == "WARNING" ? <CIcon icon={cilWarning} className="me-2 text-warning" size="lg" /> : <CIcon icon={cilWarning} className="me-2 text-danger" size="lg" />
        ),
      },
      { accessorKey: 'alertid', header: 'alertid' },
      { accessorKey: 'alertpriority', header: 'alertpriority' },
      { accessorKey: 'ipaddress', header: 'ipaddress' },
      { accessorKey: 'alerttype', header: 'alerttype' },
      { accessorKey: 'alertcount', header: 'alertcount' },
      { accessorKey: 'alertdropped', header: 'alertDropped' },
      { accessorKey: 'parent', header: 'Parent' },

    ],
    [],
  );

  // useEffect(() => {
  //   // Auto-refresh table data every 15 seconds
  //   const intervalId = setInterval(() => {
  //     fetchData(columnFilters, globalFilter, sorting, pagination);
  //   }, 100000);

  //   // Clear interval on component unmount
  //   return () => clearInterval(intervalId);
  // }, [columnFilters, globalFilter, sorting, pagination]);

  const table = useMaterialReactTable({
    columns,
    data,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableStickyHeader: true,
    enableRowSelection: true,
    muiTableBodyRowProps: ({ row }) => ({
      //conditionally style  rows
      sx: {
        backgroundColor: row.getValue('parent') === true ? '' : '',
      },
    }),
    //muiTa,bleBodyRowProps: { getRowProps },
    getRowId: (row) => row.id,
    initialState: {
      // columnVisibility,
      // columnSizing,
      //showColumnFilters: true,
    },
    manualFiltering: true,

    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading alerts' } : undefined,
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
      isLoading,
    },
    positionToolbarAlertBanner: 'bottom',
    // renderTopToolbarCustomActions: ({ table }) => (
    //   <CContainer fluid>
    //     <CButtonGroup role="group" aria-label="Basic example" flex>
    //       <CButtonGroup size="sm" role="group" aria-label="Small button group">
    //         <CButton color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilList} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-primary' icon={icon.cilApple} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-danger' icon={icon.cilLineStyle} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-warning' icon={icon.cilPaperclip} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-primary' icon={icon.cilQrCode} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilThumbUp} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-warning' icon={icon.cilTrash} size="lg" /></CButton>
    //         <CButton color="primary" variant="outline"><CIcon className='text-danger' icon={icon.cilXCircle} size="lg" /></CButton>
    //       </CButtonGroup>
    //     </CButtonGroup>
    //   </CContainer>

    // ),
  });



  // const hideElementsByClass = (className) => {
  //   const elements = document.querySelectorAll(`.${MuiBox - root}`);
  //   elements.forEach(element => {
  //     element.style.visible = 'hidden';
  //   });
  // };

  return (
    <>
      <div className={theme == 'light' ? "" : "dark-theme"}>
        {!isRefetching || !isLoading ? (<MaterialReactTable table={table} />) : ""}
      </div>
    </>
  )

};

export default DataTable;
