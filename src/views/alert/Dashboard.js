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
  const [graphVisible, setGraphVisible] = useState(false)
  const [graphData, setGraphData] = useState(null)
  const [graphLoading, setGraphLoading] = useState(false)
  const [graphError, setGraphError] = useState(null)
  const [graphTitle, setGraphTitle] = useState('')
  const graphRef = useRef(null)
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

          const openExternal = async (e) => {
            e && e.preventDefault()
            if (!entity) {
              setGraphError('No entity available')
              setGraphData(null)
              setGraphTitle('No entity')
              setGraphVisible(true)
              return
            }

            const url = `http://192.168.1.201:8080/entity/${encodeURIComponent(entity)}`
            try {
              setGraphLoading(true)
              setGraphError(null)
              setGraphTitle(`Graph for ${entity}`)
              const response = await api.get(url)
              setGraphData(response.data)
              setGraphVisible(true)
            } catch (err) {
              console.error('Failed to fetch graph:', err)
              setGraphError(err?.message || 'Failed to fetch graph')
              setGraphData(null)
              setGraphVisible(true)
            } finally {
              setGraphLoading(false)
            }
          }

          return value === 'NORMAL' ? (
            <a href="#" className="link" onClick={openExternal}>
              {value}
            </a>
          ) : (
            value
          )
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


  // Render D3 graph into modal when graphData is set and modal is visible
  useEffect(() => {
    if (!graphVisible || !graphData) return

    // debug: effect entry
    // eslint-disable-next-line no-console
    console.log('D3 effect triggered', { graphVisible, hasGraphData: !!graphData })

    // Helper: wait until container has measurable size (modal rendering may be delayed)
    const waitForSize = async (maxAttempts = 10, delayMs = 100) => {
      for (let i = 0; i < maxAttempts; i++) {
        const el = graphRef.current
        if (el) {
          const w = el.clientWidth
          const h = el.clientHeight
          if (w > 20 && h > 20) return { width: w, height: h }
        }
        // eslint-disable-next-line no-await-in-loop
        await new Promise((r) => setTimeout(r, delayMs))
      }
      const el = graphRef.current
      return { width: (el && el.clientWidth) || 800, height: (el && el.clientHeight) || 600 }
    }

    // clear previous contents
    d3.select(graphRef.current).selectAll('*').remove()

      // async render so we can wait for sizing
      ; (async () => {
        const { width, height } = await waitForSize()

        const svg = d3
          .select(graphRef.current)
          .append('svg')
          .attr('width', width)
          .attr('height', height)

        // add a container group that will be zoomed/panned
        const g = svg.append('g')

        // enable zoom and pan on the svg, transforming the container group
        const zoom = d3.zoom().scaleExtent([0.2, 6]).on('zoom', (event) => {
          g.attr('transform', event.transform)
        })
        svg.call(zoom)

        // Normalize incoming graph payload: support {nodes, edges} or {nodes, links}
        let nodes = graphData.nodes || []
        let links = graphData.links || graphData.edges || []

        // Ensure each node has an 'id' field (use name when id missing)
        nodes = nodes.map((n, i) => ({ ...n, id: n.id || n.name || `node-${i}` }))

        // Normalize links so source/target are ids (strings)
        links = links.map((l) => ({
          ...l,
          source: typeof l.source === 'object' ? (l.source.id || l.source.name) : l.source,
          target: typeof l.target === 'object' ? (l.target.id || l.target.name) : l.target,
          value: l.value || 1,
        }))

        // Build adjacency for path-finding (undirected)
        const idToNode = new Map(nodes.map((n) => [n.id, n]))
        const adj = new Map()
        nodes.forEach((n) => adj.set(n.id, []))
        links.forEach((l) => {
          if (l.source && l.target && adj.has(l.source) && adj.has(l.target)) {
            adj.get(l.source).push(l.target)
            adj.get(l.target).push(l.source)
          }
        })

        // Find alert nodes
        const alertNodeIds = Array.from(new Set(nodes.filter((n) => n.has_alert).map((n) => n.id)))

        // Helper: BFS shortest path between two node ids (returns array of ids) or null
        const bfsPath = (startId, goalId) => {
          if (startId === goalId) return [startId]
          const queue = [startId]
          const visited = new Set([startId])
          const parent = new Map()
          while (queue.length) {
            const cur = queue.shift()
            const neighbors = adj.get(cur) || []
            for (const nb of neighbors) {
              if (visited.has(nb)) continue
              visited.add(nb)
              parent.set(nb, cur)
              if (nb === goalId) {
                // reconstruct path
                const path = [goalId]
                let p = goalId
                while (p !== startId) {
                  p = parent.get(p)
                  if (!p) break
                  path.push(p)
                }
                return path.reverse()
              }
              queue.push(nb)
            }
          }
          return null
        }

        // Determine which nodes to include: nodes with alerts + any nodes on shortest paths between alert nodes
        const includedIds = new Set(alertNodeIds)
        for (let i = 0; i < alertNodeIds.length; i++) {
          for (let j = i + 1; j < alertNodeIds.length; j++) {
            const a = alertNodeIds[i]
            const b = alertNodeIds[j]
            const path = bfsPath(a, b)
            if (path && path.length > 0) {
              path.forEach((id) => includedIds.add(id))
            }
          }
        }

        // If there are no alert nodes, show only nodes that explicitly have alerts (will be empty) —
        // this follows the requirement to show only alerting nodes and their connecting path nodes.
        const nodesFiltered = nodes.filter((n) => includedIds.has(n.id))
        const linksFiltered = links.filter((l) => l.source && l.target && includedIds.has(l.source) && includedIds.has(l.target))

        // debug log
        // eslint-disable-next-line no-console
        console.log('D3 graph nodes (normalized):', nodes)
        // eslint-disable-next-line no-console
        console.log('D3 graph links (normalized):', links)
        // eslint-disable-next-line no-console
        console.log('D3 graph nodes (filtered):', nodesFiltered)
        // eslint-disable-next-line no-console
        console.log('D3 graph links (filtered):', linksFiltered)

        const simulation = d3
          .forceSimulation(nodesFiltered)
          .force('link', d3.forceLink(linksFiltered).id((d) => d.id).distance(80))
          .force('charge', d3.forceManyBody().strength(-300))
          .force('center', d3.forceCenter(width / 2, height / 2))

        function drag() {
          function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            // account for current zoom transform when fixing positions
            const t = d3.zoomTransform(svg.node())
            d.fx = t.invertX(event.x)
            d.fy = t.invertY(event.y)
          }

          function dragged(event, d) {
            const t = d3.zoomTransform(svg.node())
            d.fx = t.invertX(event.x)
            d.fy = t.invertY(event.y)
          }

          function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          }

          return d3.drag().on('start', dragstarted).on('drag', dragged).on('end', dragended)
        }

        const link = g
          .append('g')
          .attr('stroke', '#999')
          .attr('stroke-opacity', 0.6)
          .selectAll('line')
          .data(linksFiltered)
          .join('line')
          .attr('stroke-width', (d) => Math.sqrt(d.value || 1))

        const node = g
          .append('g')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1.5)
          .selectAll('circle')
          .data(nodesFiltered)
          .join('circle')
          .attr('r', (d) => (d.has_alert ? 8 : 6))
          .attr('fill', (d) => (d.severity === 'WARN' || d.severity === 'WARNING' ? '#f0ad4e' : '#69b3a2'))
          .call(drag())

        const label = g
          .append('g')
          .selectAll('text')
          .data(nodesFiltered)
          .join('text')
          .text((d) => d.id || d.name || '')
          .attr('font-size', 10)
          .attr('dx', 8)
          .attr('dy', 4)

        // add a styled HTML tooltip (better than the default SVG title)
        const escapeHtml = (unsafe) => {
          return String(unsafe)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
        }

        const formatTooltipHTML = (d) => {
          let html = '<div style="line-height:1.2">'
          if (d.id) html += `<div><strong>ID:</strong> ${escapeHtml(d.id)}</div>`
          if (d.name && d.name !== d.id) html += `<div><strong>Name:</strong> ${escapeHtml(d.name)}</div>`
          if (d.severity) html += `<div><strong>Severity:</strong> ${escapeHtml(d.severity)}</div>`
          if (typeof d.has_alert !== 'undefined') html += `<div><strong>Has alert:</strong> ${escapeHtml(String(d.has_alert))}</div>`

          const alerts = d.alerts || d.alertsList || d.alertList || d.alerts_details
          if (Array.isArray(alerts) && alerts.length > 0) {
            html += '<div style="margin-top:6px"><strong>Alerts:</strong><ul style="margin:6px 0 0 16px;padding:0">'
            alerts.forEach((a) => {
              const summary = a.alertsummary || a.summary || a.message || a.title || a.text || a.body || JSON.stringify(a)
              html += `<li style="margin-bottom:4px">${escapeHtml(summary)}</li>`
            })
            html += '</ul></div>'
          }

          html += '</div>'
          return html
        }

        // create tooltip div inside the graph container
        const container = d3.select(graphRef.current)
        // remove any existing tooltip to avoid duplicates
        container.selectAll('.d3-tooltip').remove()
        const tooltip = container.append('div')
          .attr('class', 'd3-tooltip')
          .style('position', 'absolute')
          .style('pointer-events', 'none')
          .style('background', 'rgba(0,0,0,0.85)')
          .style('color', '#fff')
          .style('padding', '8px')
          .style('border-radius', '6px')
          .style('font-size', '12px')
          .style('max-width', '360px')
          .style('display', 'none')
          .style('z-index', 1000)

        node.on('mouseenter', function (event, d) {
          tooltip.html(formatTooltipHTML(d)).style('display', 'block')
        })
          .on('mousemove', function (event) {
            const rect = graphRef.current.getBoundingClientRect()
            const x = event.clientX - rect.left + 12
            const y = event.clientY - rect.top + 12
            tooltip.style('left', `${x}px`).style('top', `${y}px`)
          })
          .on('mouseleave', function () {
            tooltip.style('display', 'none')
          })

        simulation.on('tick', () => {
          link.attr('x1', (d) => d.source.x).attr('y1', (d) => d.source.y).attr('x2', (d) => d.target.x).attr('y2', (d) => d.target.y)

          node.attr('cx', (d) => d.x).attr('cy', (d) => d.y)

          label.attr('x', (d) => d.x).attr('y', (d) => d.y)
        })

        // cleanup when modal closes
        return () => {
          simulation.stop()
          d3.select(graphRef.current).selectAll('*').remove()
        }
      })()
  }, [graphVisible, graphData])

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
        <CModal
          visible={graphVisible}
          onClose={() => setGraphVisible(false)}
          size="xl"
          aria-labelledby="Graph Modal"
        >
          <CModalHeader>
            <CModalTitle id="graphTitle">{graphTitle}</CModalTitle>
          </CModalHeader>
          <CModalBody style={{ minHeight: '60vh' }}>
            {graphLoading && <div>Loading graph...</div>}
            {graphError && <div style={{ color: 'red' }}>{graphError}</div>}
            {!graphLoading && !graphError && graphData && (
              <div ref={graphRef} style={{ width: '100%', height: '60vh' }} />
            )}
            {!graphLoading && !graphError && !graphData && (
              <div>No graph data available.</div>
            )}
          </CModalBody>
          <CModalFooter>
            <CButton color="secondary" onClick={() => setGraphVisible(false)}>
              Close
            </CButton>
          </CModalFooter>
        </CModal>
      </div>
    </>
  )
};

export default DataTable;
