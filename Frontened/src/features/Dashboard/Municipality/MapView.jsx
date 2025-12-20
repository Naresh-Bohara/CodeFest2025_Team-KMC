import React, { useState, useEffect, useRef } from 'react'
import { MapPin, Filter, Search, ArrowLeft, AlertTriangle, CheckCircle, Clock, User, ZoomIn, ZoomOut, Navigation, Maximize, Minimize, Loader2, RefreshCw, Layers } from 'lucide-react'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

const MAP_STYLE = 'https://demotiles.maplibre.org/style.json'

// Sample municipalities - replace with your API data
const MUNICIPALITIES = [
  { _id: '1', name: 'Kathmandu', location: { coordinates: { lat: 27.708317, lng: 85.3205817 }}, boundaryBox: { minLat: 27.618317, maxLat: 27.798317, minLng: 85.2305817, maxLng: 85.4106 }},
  { _id: '2', name: 'Pokhara', location: { coordinates: { lat: 28.2096, lng: 83.9856 }}, boundaryBox: { minLat: 28.1096, maxLat: 28.3096, minLng: 83.8856, maxLng: 84.0856 }}
]

// Sample reports - replace with your useGetReportsQuery
const SAMPLE_REPORTS = [
  { _id: '1', title: 'Road Damage', description: 'Pothole on main street', category: 'road', status: 'pending', priority: 'high', location: { coordinates: { lat: 27.7172, lng: 85.324 }, address: 'Thamel, Kathmandu', ward: '26' }, citizenId: { name: 'Ram Sharma' }, createdAt: '2025-12-19T10:30:00Z' },
  { _id: '2', title: 'Street Light Issue', description: 'Lights not working', category: 'electricity', status: 'in_progress', priority: 'medium', location: { coordinates: { lat: 27.7089, lng: 85.3206 }, address: 'Lazimpat', ward: '2' }, citizenId: { name: 'Sita Rai' }, createdAt: '2025-12-18T14:20:00Z' },
  { _id: '3', title: 'Water Leakage', description: 'Pipe leaking badly', category: 'water', status: 'resolved', priority: 'high', location: { coordinates: { lat: 27.7040, lng: 85.3180 }, address: 'Maitighar', ward: '3' }, citizenId: { name: 'Krishna Thapa' }, createdAt: '2025-12-17T09:15:00Z' }
]

const STATUS_COLORS = { pending: '#eab308', assigned: '#3b82f6', in_progress: '#f97316', resolved: '#10b981' }
const CATEGORY_ICONS = { road: '🚧', electricity: '⚡', water: '💧', sanitation: '🧹', garbage: '🗑️', emergency: '🚨' }

const MapView = ({ navigate: nav }) => {
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markers = useRef([])
  
  const [loading, setLoading] = useState(true)
  const [reports] = useState(SAMPLE_REPORTS)
  const [selectedReport, setSelectedReport] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [showBoundaries, setShowBoundaries] = useState(true)
  const [zoom, setZoom] = useState(11)

  const filteredReports = reports.filter(r => {
    const search = searchQuery.toLowerCase()
    const matchSearch = !search || r.title.toLowerCase().includes(search) || r.description.toLowerCase().includes(search)
    const matchStatus = statusFilter === 'all' || r.status === statusFilter
    const matchCategory = categoryFilter === 'all' || r.category === categoryFilter
    return matchSearch && matchStatus && matchCategory
  })

  const getCoords = (report) => {
    const c = report?.location?.coordinates
    if (c?.lat && c?.lng) return [parseFloat(c.lng), parseFloat(c.lat)]
    return null
  }

  useEffect(() => {
    if (!mapRef.current) return

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: MAP_STYLE,
      center: [85.324, 27.7172],
      zoom: 11,
      attributionControl: false
    })

    map.addControl(new maplibregl.NavigationControl(), 'top-right')
    map.addControl(new maplibregl.ScaleControl({ maxWidth: 100, unit: 'metric' }), 'bottom-left')

    map.on('load', () => {
      setLoading(false)
      addBoundaries(map)
      updateMarkers(map, filteredReports, selectedReport)
    })

    map.on('zoom', () => setZoom(Math.round(map.getZoom() * 10) / 10))

    mapInstance.current = map
    return () => map.remove()
  }, [])

  useEffect(() => {
    if (mapInstance.current && !loading) {
      updateMarkers(mapInstance.current, filteredReports, selectedReport)
    }
  }, [filteredReports, selectedReport])

  const addBoundaries = (map) => {
    MUNICIPALITIES.forEach(muni => {
      if (!muni.boundaryBox) return
      
      const { minLat, maxLat, minLng, maxLng } = muni.boundaryBox
      const id = `muni-${muni._id}`
      
      map.addSource(id, {
        type: 'geojson',
        data: {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [[[minLng, minLat], [maxLng, minLat], [maxLng, maxLat], [minLng, maxLat], [minLng, minLat]]]
          }
        }
      })

      map.addLayer({ id: `${id}-fill`, type: 'fill', source: id, paint: { 'fill-color': '#3b82f6', 'fill-opacity': 0.1 }})
      map.addLayer({ id: `${id}-line`, type: 'line', source: id, paint: { 'line-color': '#3b82f6', 'line-width': 2, 'line-opacity': 0.8 }})
      
      map.addLayer({
        id: `${id}-label`,
        type: 'symbol',
        source: id,
        layout: { 'text-field': muni.name, 'text-size': 14, 'text-font': ['Open Sans Bold', 'Arial Unicode MS Bold'] },
        paint: { 'text-color': '#1e40af', 'text-halo-color': '#fff', 'text-halo-width': 2 }
      })

      map.on('click', `${id}-fill`, () => {
        map.flyTo({ center: [(minLng + maxLng) / 2, (minLat + maxLat) / 2], zoom: 12, duration: 1000 })
      })
    })
  }

  const updateMarkers = (map, reports, selected) => {
    markers.current.forEach(m => m.remove())
    markers.current = []

    reports.forEach(report => {
      const coords = getCoords(report)
      if (!coords) return

      const isSelected = selected?._id === report._id
      const color = isSelected ? '#ef4444' : STATUS_COLORS[report.status] || '#6b7280'
      const icon = CATEGORY_ICONS[report.category] || '📍'

      const el = document.createElement('div')
      el.style.cssText = `
        width: ${isSelected ? 50 : 42}px;
        height: ${isSelected ? 50 : 42}px;
        border-radius: 50%;
        background: ${color};
        border: 3px solid white;
        box-shadow: ${isSelected ? '0 8px 24px rgba(239,68,68,0.6)' : '0 4px 12px rgba(0,0,0,0.3)'};
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: all 0.3s;
        z-index: ${isSelected ? 1000 : 1};
        font-size: ${isSelected ? 24 : 20}px;
        ${isSelected ? 'animation: pulse 2s infinite;' : ''}
      `
      el.innerHTML = icon

      const style = document.createElement('style')
      style.textContent = '@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.1); }}'
      document.head.appendChild(style)

      const popup = createPopup(report, color, icon)
      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(coords)
        .setPopup(popup)
        .addTo(map)

      el.onclick = (e) => {
        e.stopPropagation()
        setSelectedReport(report)
        map.flyTo({ center: coords, zoom: 15, duration: 1000 })
        setTimeout(() => marker.togglePopup(), 500)
      }

      markers.current.push(marker)
    })
  }

  const createPopup = (report, color, icon) => {
    const div = document.createElement('div')
    div.style.cssText = 'min-width: 320px; padding: 20px; font-family: system-ui;'
    
    const date = new Date(report.createdAt).toLocaleDateString('en-US', { 
      month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' 
    })

    div.innerHTML = `
      <div style="display: flex; gap: 12px; margin-bottom: 16px;">
        <div style="width: 48px; height: 48px; border-radius: 12px; background: ${color}; display: flex; align-items: center; justify-content: center; font-size: 24px;">${icon}</div>
        <div style="flex: 1;">
          <h3 style="margin: 0 0 8px; font-size: 17px; font-weight: 700; color: #111;">${report.title}</h3>
          <div style="display: flex; gap: 6px;">
            <span style="background: ${color}20; color: ${color}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${report.status.toUpperCase()}</span>
            <span style="background: ${report.priority === 'high' ? '#fee' : report.priority === 'medium' ? '#fffbeb' : '#f0fdf4'}; color: ${report.priority === 'high' ? '#dc2626' : report.priority === 'medium' ? '#ca8a04' : '#16a34a'}; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${report.priority.toUpperCase()}</span>
          </div>
        </div>
      </div>
      <p style="margin: 0 0 12px; color: #666; font-size: 14px; line-height: 1.5;">${report.description}</p>
      <div style="background: #f9fafb; border-radius: 8px; padding: 12px; margin-bottom: 12px;">
        <div style="display: flex; gap: 8px; margin-bottom: 8px;">
          <svg style="width: 16px; height: 16px; color: #666; margin-top: 2px;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
          <div><div style="color: #111; font-size: 13px; font-weight: 500;">${report.location.address}</div>${report.location.ward ? `<div style="color: #666; font-size: 12px;">Ward ${report.location.ward}</div>` : ''}</div>
        </div>
        <div style="display: flex; gap: 8px;">
          <svg style="width: 16px; height: 16px; color: #666;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
          <span style="color: #333; font-size: 13px;">${report.citizenId.name}</span>
        </div>
      </div>
      <div style="display: flex; justify-content: space-between; align-items: center; padding-top: 12px; border-top: 1px solid #e5e7eb;">
        <button style="background: ${color}; color: white; border: none; padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer;">View Details</button>
        <div style="text-align: right;"><div style="font-size: 11px; color: #999;">${date}</div><div style="font-size: 10px; color: #ccc;">ID: ${report._id.substring(0, 8)}</div></div>
      </div>
    `
    return new maplibregl.Popup({ offset: 25, maxWidth: '380px', closeButton: true }).setDOMContent(div)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader2 className="w-16 h-16 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Loading Map</h2>
          <p className="text-gray-600">Preparing data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-screen">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-white/95 backdrop-blur shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={() => nav?.(-1) || window.history.back()} className="p-2 hover:bg-gray-100 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Municipality Report Map</h1>
                <p className="text-sm text-gray-600">{reports.length} Total • {filteredReports.length} Visible • {MUNICIPALITIES.length} Municipalities</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowBoundaries(!showBoundaries)} className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${showBoundaries ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300'}`}>
                <Layers className="w-4 h-4" />
                <span className="text-sm font-medium">Boundaries</span>
              </button>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10 pr-4 py-2 w-64 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
              <option value="all">All Categories</option>
              <option value="road">🚧 Road</option>
              <option value="electricity">⚡ Electricity</option>
              <option value="water">💧 Water</option>
            </select>
            <button onClick={() => { setSearchQuery(''); setStatusFilter('all'); setCategoryFilter('all'); setSelectedReport(null); }} className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Clear</button>
          </div>
        </div>
      </div>

      {/* Map */}
      <div ref={mapRef} className="absolute inset-0 bg-gray-200" />

      {/* Controls */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <button onClick={() => mapInstance.current?.zoomIn()} className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50"><ZoomIn className="w-5 h-5" /></button>
        <button onClick={() => mapInstance.current?.zoomOut()} className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50"><ZoomOut className="w-5 h-5" /></button>
        <button onClick={() => { mapInstance.current?.flyTo({ center: [85.324, 27.7172], zoom: 11, duration: 1000 }); setSelectedReport(null); }} className="p-3 bg-white rounded-lg shadow-lg hover:bg-gray-50"><Navigation className="w-5 h-5" /></button>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 bg-white rounded-lg shadow-lg p-4">
        <h3 className="font-semibold mb-2">Status</h3>
        {Object.entries(STATUS_COLORS).map(([status, color]) => (
          <div key={status} className="flex items-center gap-2 mb-1">
            <div className="w-3 h-3 rounded-full" style={{ background: color }} />
            <span className="text-sm capitalize">{status.replace('_', ' ')}</span>
          </div>
        ))}
        {selectedReport && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-sm font-medium">Selected</span>
            </div>
          </div>
        )}
      </div>

      {/* Reports List */}
      <div className="absolute top-32 left-4 bottom-4 w-80 bg-white rounded-xl shadow-lg overflow-hidden hidden md:block z-10">
        <div className="p-4 border-b">
          <h2 className="font-semibold">Reports ({filteredReports.length})</h2>
        </div>
        <div className="overflow-y-auto h-full pb-20">
          {filteredReports.map(r => {
            const coords = getCoords(r)
            const isSelected = selectedReport?._id === r._id
            return (
              <div key={r._id} onClick={() => coords && mapInstance.current?.flyTo({ center: coords, zoom: 15, duration: 1000 }) || setSelectedReport(r)} className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border-l-4 border-blue-500' : ''}`}>
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-lg" style={{ background: isSelected ? '#ef4444' : STATUS_COLORS[r.status] }}>{CATEGORY_ICONS[r.category]}</div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{r.title}</h3>
                    <div className="flex gap-2 mt-1">
                      <span className="px-2 py-0.5 rounded text-xs font-medium" style={{ background: `${STATUS_COLORS[r.status]}20`, color: STATUS_COLORS[r.status] }}>{r.status}</span>
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100">{r.priority}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 truncate">{r.location.address}</p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default MapView