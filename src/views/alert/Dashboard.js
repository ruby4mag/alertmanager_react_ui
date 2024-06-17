import { useEffect, useMemo, useState } from 'react';
import { CForm, CFormLabel, CFormTextarea, CButtonGroup, CButton, CTable, CTableHead, CTableRow, CTableHeaderCell, CTableBody, CTableDataCell, CContainer } from '@coreui/react';
import CIcon from '@coreui/icons-react'
import { cilArrowThickRight } from '@coreui/icons'
import {
  MaterialReactTable,
  useMaterialReactTable,
} from 'material-react-table';
import SlidingPane from 'react-sliding-pane';
import 'react-sliding-pane/dist/react-sliding-pane.css';

const CommentComponent = () => {
  const [comment, setComment] = useState("")
  return (
    <CContainer>
      <CForm>
        <div className="mb-3">
          <CFormLabel htmlFor="exampleFormControlTextarea1">Add Comment</CFormLabel>
          <CFormTextarea id="exampleFormControlTextarea12" rows={3} placeholder="Add Comment" value={comment} onChange={(e) => setComment(e.target.value)}></CFormTextarea>
        </div>
      </CForm>
      <CButton disabled={comment == "" ? true : false} variant="outline" color="primary">Add Comment</CButton>
    </CContainer>
  )
}

const SliderComponent = (sliderdata) => {


  const d = sliderdata
  console.log(d)
  const isObject = (variable) => {
    return variable !== null && typeof variable === 'object' && !Array.isArray(variable);
  };
  return (
    <>
      {/* <div>
        <table>
          <tbody>
            {Object.keys(d['sdata']).map(key => (

              < tr key={key} >
                <td>{key}</td>
                <td> {isObject(d['sdata'][key]) ? "" : d['sdata'][key]} </td>
              </tr>

            ))}
          </tbody>
        </table>
      </div > */}
      <CContainer>
        <CTable bordered >
          <CTableHead>

          </CTableHead>
          <CTableBody>
            <CTableRow>
              <CTableHeaderCell scope="row">Entity</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['entity']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Entity</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['entity']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Time</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertTime']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Latest Time</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertLastTime']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Clear Time</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertClearTime']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Source</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertSource']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Service Name</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['serviceName']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Summary</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertSummary']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Status</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertStatus']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Notes</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertNotes']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Acknowledged</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertAcked']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Severity</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['severity']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Id</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertId']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Priority</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertPriority']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Ip Addess</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['ipAddress']}</CTableDataCell>
            </CTableRow>
            <CTableRow>
              <CTableHeaderCell scope="row">Alert Count</CTableHeaderCell>
              <CTableDataCell>{d['sdata']['alertCount']}</CTableDataCell>
            </CTableRow>
          </CTableBody>
        </CTable>
      </CContainer>
      <CommentComponent></CommentComponent>
    </>
  );
};


const DataTable = () => {

  // Sliding Pane
  const [state, setState] = useState({
    isPaneOpen: false,
    isPaneOpenLeft: false,
  });

  const [sliderdata, setSliderdata] = useState({})

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
        ? 'http://192.168.1.201:8080'
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
          <span
            style={{ cursor: 'pointer', color: 'blue', textDecoration: 'underline' }}
            onClick={() => {
              setState({ isPaneOpen: true })
              setSliderdata(cell.row.original)

            }}
          >
            {cell.getValue()}
          </span>
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
      <MaterialReactTable table={table} />
      <div>
        <SlidingPane style={{ marginTop: '532px' }}
          className="dsome-custom-class"
          overlayClassName="some-custom-overlay-class"
          isOpen={state.isPaneOpen}
          closeIcon={<div><CIcon icon={cilArrowThickRight} className="me-2" /></div>}
          title="Event Details"
          subtitle=""
          width="80%"
          onRequestClose={() => {
            setState({ isPaneOpen: false });
          }}
        >
          <SliderComponent sdata={sliderdata} />
        </SlidingPane>

      </div>
    </>
  )

};

export default DataTable;
