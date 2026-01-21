import { useEffect, useMemo, useState, useRef, act } from 'react';
import { cilWarning } from '@coreui/icons'
import { CButtonGroup, CButton, CContainer, CToaster, CModal, CModalHeader, CModalTitle, CModalBody, CModalFooter, CFormTextarea, CForm } from '@coreui/react';
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import CIcon from '@coreui/icons-react'
import * as icon from '@coreui/icons';
import { Link } from 'react-router-dom';
import useAxios from '../../services/useAxios';
import * as d3 from 'd3'
import './styles.css'; // Import your custom CSS
import MyToast from '../../components/Toast'
import { IconButton, Tooltip } from '@mui/material';

import RefreshIcon from '@mui/icons-material/Refresh';

const DataTable = () => {
  const [visible, setVisible] = useState(false)

  const [toast, addToast] = useState(0)
  const toaster = useRef()
  const [comment, setComment] = useState("")
  const [modalTitle, setModalTitle] = useState("")
  const [modalAction, setModalAction] = useState("")

  const isFirstRender = useRef(true);
  const [theme, setTheme] = useState(localStorage.getItem('coreui-free-react-admin-template-theme') || 'dark');
  const [selectedRowIds, setSelectedRowIds] = useState({});
  const [rowSelection, setRowSelection] = useState({});
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

    url.searchParams.set('start', `${pagination.pageIndex * pagination.pageSize}`);
    url.searchParams.set('size', `${pagination.pageSize}`);
    url.searchParams.set('filters', JSON.stringify(columnFilters ?? []));
    url.searchParams.set('globalFilter', globalFilter ?? '');
    url.searchParams.set('sorting', JSON.stringify(sorting ?? []));

    try {
      const response = await api.get(url.href);
      const json = response.data;

      const enrichedData = await Promise.all(json.data.map(async (row) => {
        if (row.groupalerts && row.groupalerts.length > 0) {
          try {
            const detailRes = await api.get(`/api/alerts/${row._id}`);
            const childAlerts = detailRes.data.childalerts || [];
            const openCount = childAlerts.filter(c => c.alertstatus === 'OPEN').length;
            return { ...row, openGroupCount: openCount };
          } catch (e) {
            console.error('Error fetching group details', e);
            return row;
          }
        }
        return row;
      }));

      setData(enrichedData);
      setRowCount(json.totalRowCount);
    } catch (error) {
      setIsError(true);
      console.error(error);
      return
    }
    setIsError(false);
    setIsLoading(false);
    setIsRefetching(false);
    isFirstRender.current = false;
  };

  useEffect(() => {
    localStorage.setItem('columnFilters', JSON.stringify(columnFilters));
    localStorage.setItem('globalFilter', globalFilter);
    localStorage.setItem('sorting', JSON.stringify(sorting));
    localStorage.setItem('pagination', JSON.stringify(pagination));
    fetchData(columnFilters, globalFilter, sorting, pagination);
  }, [pagination, columnFilters, globalFilter, sorting]);

  useEffect(() => {
    localStorage.setItem('columnOrder', JSON.stringify(columnOrder));
    localStorage.setItem('columnVisibility', JSON.stringify(columnVisibility));
    localStorage.setItem('density', density);
    localStorage.setItem('columnSizing', JSON.stringify(columnSizing));
  }, [columnOrder, density, columnVisibility, columnSizing]);


  const columns = useMemo(
    () => [
      {
        accessorKey: 'entity', header: 'Entity', Cell: ({ cell }) => (
          <Link className="link" to={`/alert/details/${cell.row.original._id}`} >
            {cell.row.original.groupalerts && (cell.row.original.groupalerts).length > 0 ?
              <div><span className="badge text-bg-warning" style={{ marginRight: '5px' }}>{cell.row.original.openGroupCount ?? cell.row.original.groupalerts.length}</span>{cell.getValue()}</div>
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
          cell.getValue() == "OPEN" ? <span className="badge text-bg-warning">{cell.getValue()}</span> : <span className="badge text-bg-success">CLOSED</span>
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
      {
        accessorKey: 'alertpriority',
        header: 'alertpriority',
        Cell: ({ cell }) => {
          const value = cell.getValue()
          const entity = cell.row.original && cell.row.original.entity

          return value
        },
      },
      { accessorKey: 'ipaddress', header: 'ipaddress' },
      { accessorKey: 'alerttype', header: 'alerttype' },
      { accessorKey: 'alertcount', header: 'alertcount' },
      { accessorKey: 'alertdropped', header: 'alertDropped' },
      { accessorKey: 'parent', header: 'Parent' },
    ],
  );

  const handleActionButtonClick = (ModelAction) => {
    var action
    if (typeof ModelAction === 'object') {
      action = ModelAction['modalAction']
    } else {
      action = ModelAction
    }
    const selectedIds = Object.keys(selectedRowIds).filter((_id) => selectedRowIds[_id]);
    const selectedDataIds = selectedIds.map((rowId) => data[rowId]?._id);

    // Acknowledge Action
    if (action == 'ack') {
      const newComment = {
        comment: "Alert Acknowledged"
      };
      selectedDataIds.forEach(async (alertid) => {
        try {
          const response = await api.post(`/api/alerts/${alertid}/acknowledge`, newComment);
          console.log(`Alert ${alertid} acknowledged:`, response.data);
          addToast(MyToast({
            title: "Alert Acknowledgement",
            timestamp: "Just now",
            body: "Alert acknowledged successfully",
            color: 'success',
            autohide: true,
            dismissible: true
          }))
          fetchData(columnFilters, globalFilter, sorting, pagination);

        } catch (error) {
          console.error(`Failed to acknowledge alert ${alertid}:`, error);
        }
      });
      setRowSelection({})
      setSelectedRowIds({})
    }

    // Unacknowledge Action
    if (action == 'unack') {
      const newComment = {
        comment: "Alert Unacknowledged"
      };
      selectedDataIds.forEach(async (alertid) => {
        try {
          const response = await api.post(`/api/alerts/${alertid}/unacknowledge`, newComment);
          console.log(`Alert ${alertid} acknowledged:`, response.data);
          addToast(MyToast({
            title: "Alert Acknowledgement",
            timestamp: "Just now",
            body: "Alert unacknowledged successfully",
            color: 'success',
            autohide: true,
            dismissible: true
          }))
          fetchData(columnFilters, globalFilter, sorting, pagination);
        } catch (error) {
          console.error(`Failed to acknowledge alert ${alertid}:`, error);
        }
      });
      setRowSelection({})
      setSelectedRowIds({})
    }

    // Comment Action
    if (action == 'comment') {
      const newComment = {
        comment: comment
      };
      selectedDataIds.forEach(async (alertid) => {
        try {
          const response = await api.post(`/api/alerts/${alertid}/comment`, newComment);
          console.log(`Alert ${alertid} acknowledged:`, response.data);
          addToast(MyToast({
            title: "Alert Comment",
            timestamp: "Just now",
            body: "Alert commented successfully",
            color: 'success',
            autohide: true,
            dismissible: true
          }))
          fetchData(columnFilters, globalFilter, sorting, pagination);
        } catch (error) {
          console.error(`Failed to commented alert ${alertid}:`, error);
        }
      });
      setRowSelection({})
      setComment("")
      setSelectedRowIds({})
      setVisible(!visible)
    }

    // Clear Action
    if (action == 'clear') {
      const newComment = {
        comment: comment
      };
      selectedDataIds.forEach(async (alertid) => {
        try {
          const response = await api.post(`/api/alerts/${alertid}/clear`, newComment);
          console.log(`Alert ${alertid} cleared:`, response.data);
          addToast(MyToast({
            title: "Alert Clear",
            timestamp: "Just now",
            body: "Alert cleared successfully",
            color: 'success',
            autohide: true,
            dismissible: true
          }))
          fetchData(columnFilters, globalFilter, sorting, pagination);
          setRowSelection({})
          setComment("")
          setSelectedRowIds({})
          setVisible(!visible)
        } catch (error) {
          console.error(`Failed to clear alert ${alertid}:`, error);
        }
      });
    }
    console.log('Selected Data IDs:', selectedDataIds);
  };

  const openModal = (action) => {
    if (action === "clear") {
      setModalTitle("Clear alert(s)")
      setModalAction("clear")
      setVisible(!visible)
    }
    if (action === "comment") {
      setModalTitle("Comment alert(s)")
      setModalAction("comment")
      setVisible(!visible)
    }
  }

  const handlePaginationChange = (updater) => {
    if (isFirstRender.current) return;
    //call the setState as normal, but need to check if using an updater callback with a previous state
    setPagination((prevPagination) =>
      //if updater is a function, call it with the previous state, otherwise just use the updater value
      updater instanceof Function ? updater(prevPagination) : JSON.parse(localStorage.getItem('pagination')),
    );

    //put more code for your side effects here, guaranteed to only run once, even in React Strict Mode
  };

  const handleRowSelectionChange = (rowSelection) => {
    setRowSelection(rowSelection);
    setSelectedRowIds(rowSelection);
  };

  useEffect(() => {
    // Auto-refresh table data every 15 seconds
    const intervalId = setInterval(() => {
      fetchData(columnFilters, globalFilter, sorting, pagination);
    }, 10000);

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
    muiTableBodyRowProps: ({ row }) => ({
      //conditionally style  rows
      sx: {
        backgroundColor: row.getValue('parent') === true ? '' : '',
      },
    }),
    getRowId: (row) => row.id,
    initialState: {
      //showColumnFilters: true,
    },
    manualFiltering: true,
    manualPagination: true,
    manualSorting: true,
    muiToolbarAlertBannerProps: isError ? { color: 'error', children: 'Error loading alerts' } : undefined,
    renderTopToolbarCustomActions: ({ table }) => (
      <CContainer fluid>
        <Tooltip arrow title="Refresh Data">
          <IconButton onClick={() => fetchData(columnFilters, globalFilter, sorting, pagination)}>
            <RefreshIcon />
          </IconButton>
        </Tooltip>
        {Object.keys(selectedRowIds).length > 0 && (
          <CButtonGroup size="sm" role="group" aria-label="Small button group">
            <CButton onClick={() => handleActionButtonClick('ack')} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilUserFollow} size="lg" /></CButton>
            <CButton onClick={() => handleActionButtonClick('unack')} color="primary" variant="outline"><CIcon className='text-warning' icon={icon.cilUserUnfollow} size="lg" /></CButton>
            <CButton onClick={() => openModal("comment")} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilCommentSquare} size="lg" /></CButton>
            <CButton onClick={() => openModal("clear")} color="primary" variant="outline"><CIcon className='text-success' icon={icon.cilCheckCircle} size="lg" /></CButton>
          </CButtonGroup>
        )}

      </CContainer>
    ),
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: handlePaginationChange,
    onSortingChange: setSorting,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    onDensityChange: setDensity,
    onColumnSizingChange: setColumnSizing,
    onRowSelectionChange: handleRowSelectionChange,
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
      rowSelection
    },
    positionToolbarAlertBanner: 'bottom',
  });

  return (
    <>
      <div className={theme == 'light' ? "" : "dark-theme"}>
        <CToaster ref={toaster} push={toast} placement="top-end" />
        <MaterialReactTable table={table} />
        <CModal
          visible={visible}
          onClose={() => setVisible(false)}
          aria-labelledby="Comment Alerts"
        >
          <CModalHeader>
            <CModalTitle id="alertComment">{modalTitle}</CModalTitle>
          </CModalHeader>
          <CModalBody>
            <CForm>
              <div className="mb-3">
                <CFormTextarea id="exampleFormControlTextarea12" rows={3} placeholder="Add Comment" value={comment} onChange={(e) => setComment(e.target.value)}></CFormTextarea>
              </div>
            </CForm>
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setVisible(false)}>
              CANCEL
            </CButton>
            <CButton onClick={() => handleActionButtonClick({ modalAction })} color="primary">{modalAction.toUpperCase()}</CButton>
          </CModalFooter>
        </CModal>

      </div>
    </>
  )
};

export default DataTable;
