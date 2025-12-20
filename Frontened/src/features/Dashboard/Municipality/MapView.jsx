import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { 
  MapPin, Filter, Search, X, ArrowLeft, Eye, AlertTriangle, CheckCircle, 
  Clock, User, Building, Calendar, Award, Shield, ZoomIn, ZoomOut, 
  Navigation, Maximize, Minimize, Loader2, RefreshCw 
} from 'lucide-react';
import { useGetAllMunicipalitiesQuery, useGetMunicipalitiesQuery } from '../../../store/api/Municipality';
import { useGetReportsQuery } from '../../../store/api/reportApi';



const MAPTILER_KEY = "aNDo9TglgR1QMgzUYT1N";

function MapView() {
  const navigate = useNavigate();
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);
  
  // RTK Query for real data
  const { 
    data: municipalitiesData, 
    isLoading: isLoadingMunicipalities, 
    isError: isErrorMunicipalities,
    refetch: refetchMunicipalities 
  } = useGetAllMunicipalitiesQuery();
  
  const { 
    data: reportsData, 
    isLoading: isLoadingReports, 
    isError: isErrorReports,
    refetch: refetchReports 
  } = useGetReportsQuery();
  
  console.log(municipalitiesData,reportsData)
  // Extract real data from API responses
  const municipalities = municipalitiesData?.data || [];
  const reports = reportsData?.data || [];
  
  const [loading, setLoading] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(12);

  // Status options based on your report data structure
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'assigned', label: 'Assigned', color: 'blue', icon: User },
    { value: 'in_progress', label: 'In Progress', color: 'orange', icon: AlertTriangle },
    { value: 'resolved', label: 'Resolved', color: 'green', icon: CheckCircle }
  ];

  // Category options based on your report data
  const categories = [
    { value: 'all', label: 'All Categories', icon: '📍' },
    { value: 'road', label: 'Road Issues', icon: '🚧', color: 'orange' },
    { value: 'electricity', label: 'Electricity', icon: '⚡', color: 'yellow' },
    { value: 'water', label: 'Water Supply', icon: '💧', color: 'blue' },
    { value: 'sanitation', label: 'Sanitation', icon: '🧹', color: 'brown' },
    { value: 'safety', label: 'Safety', icon: '🛡️', color: 'red' },
    { value: 'emergency', label: 'Emergency', icon: '🚨', color: 'red' },
    { value: 'illegal_activity', label: 'Illegal Activity', icon: '🚫', color: 'purple' }
  ];

  // Filter reports based on actual data structure
  const filteredReports = reports.filter(report => {
    const matchesSearch = searchQuery === '' || 
      report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.location?.address?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Get marker color by status
  const getMarkerColor = (status) => {
    switch (status) {
      case 'resolved': return '#10b981'; // green
      case 'in_progress': return '#f97316'; // orange
      case 'assigned': return '#3b82f6'; // blue
      case 'pending': return '#eab308'; // yellow
      default: return '#6b7280'; // gray
    }
  };

  // Get marker icon by category
  const getMarkerIcon = (category) => {
    const cat = categories.find(c => c.value === category);
    return cat?.icon || '📍';
  };

  // Initialize map with useEffect [citation:4]
  useEffect(() => {
    if (isLoadingMunicipalities || isLoadingReports) return;
    
    if (!mapContainerRef.current) return;

    const initializeMap = () => {
      // Calculate center from real data or default to Nepal
      const allReports = reports.filter(r => r.location?.coordinates);
      const centerCoords = allReports.length > 0 
        ? calculateCenter(allReports)
        : [85.3240, 27.7172]; // Default Nepal center

      const mapInstance = new maplibregl.Map({
        container: mapContainerRef.current,
        style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_KEY}`,
        center: centerCoords,
        zoom: allReports.length > 1 ? 10 : 14,
        attributionControl: false
      });

      mapInstance.addControl(new maplibregl.NavigationControl(), 'top-right');
      
      mapInstance.addControl(new maplibregl.ScaleControl({
        maxWidth: 100,
        unit: 'metric'
      }), 'bottom-left');

      mapInstance.on('load', () => {
        setLoading(false);
        addMunicipalityBoundaries(mapInstance);
        addReportMarkers(mapInstance);
      });

      mapInstance.on('zoom', () => {
        setZoomLevel(mapInstance.getZoom());
      });

      mapInstance.on('error', (e) => {
        console.error('Map error:', e.error);
      });

      mapInstanceRef.current = mapInstance;

      return () => {
        mapInstance.remove();
      };
    };

    initializeMap();
  }, [isLoadingMunicipalities, isLoadingReports, municipalities, reports]);

  // Calculate center from reports with coordinates
  const calculateCenter = (reports) => {
    const reportsWithCoords = reports.filter(r => r.location?.coordinates?.lat && r.location?.coordinates?.lng);
    
    if (reportsWithCoords.length === 0) return [85.3240, 27.7172];
    
    const lngs = reportsWithCoords.map(r => r.location.coordinates.lng);
    const lats = reportsWithCoords.map(r => r.location.coordinates.lat);
    
    const avgLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const avgLat = lats.reduce((a, b) => a + b, 0) / lats.length;
    
    return [avgLng, avgLat];
  };

  // Add municipality boundaries based on real data
  const addMunicipalityBoundaries = (map) => {
    municipalities.forEach((municipality) => {
      if (municipality.boundaryBox) {
        const { minLat, maxLat, minLng, maxLng } = municipality.boundaryBox;
        
        const boundaryCoords = [
          [minLng, minLat],
          [maxLng, minLat],
          [maxLng, maxLat],
          [minLng, maxLat],
          [minLng, minLat]
        ];

        // Add boundary as a polygon layer
        map.addSource(`boundary-${municipality._id}`, {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'Polygon',
              coordinates: [boundaryCoords]
            },
            properties: {
              name: municipality.name,
              id: municipality._id
            }
          }
        });

        map.addLayer({
          id: `boundary-layer-${municipality._id}`,
          type: 'fill',
          source: `boundary-${municipality._id}`,
          paint: {
            'fill-color': '#3b82f6',
            'fill-opacity': 0.1,
            'fill-outline-color': '#1d4ed8'
          }
        });

        map.addLayer({
          id: `boundary-outline-${municipality._id}`,
          type: 'line',
          source: `boundary-${municipality._id}`,
          paint: {
            'line-color': '#1d4ed8',
            'line-width': 2,
            'line-dasharray': [2, 2]
          }
        });

        // Add municipality center marker if coordinates exist
        if (municipality.location?.coordinates?.lat && municipality.location?.coordinates?.lng) {
          const centerMarker = new maplibregl.Marker({ 
            color: '#1d4ed8',
            draggable: false
          })
            .setLngLat([
              municipality.location.coordinates.lng,
              municipality.location.coordinates.lat
            ])
            .setPopup(new maplibregl.Popup({ offset: 25 }).setHTML(`
              <div style="min-width: 200px;">
                <h3 style="margin:0 0 8px 0;font-size:14px;color:#1d4ed8;font-weight:bold;">
                  ${municipality.name}
                </h3>
                <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
                  <strong>City:</strong> ${municipality.location.city || 'N/A'}
                </p>
                <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
                  <strong>Province:</strong> ${municipality.location.province || 'N/A'}
                </p>
                <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
                  <strong>Status:</strong> 
                  <span style="color: ${municipality.isActive ? '#10b981' : '#ef4444'}; font-weight:bold;">
                    ${municipality.isActive ? 'Active' : 'Inactive'}
                  </span>
                </p>
                ${municipality.contactEmail ? `
                  <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
                    <strong>Email:</strong> ${municipality.contactEmail}
                  </p>
                ` : ''}
              </div>
            `))
            .addTo(map);
        }
      }
    });
  };

  // Add report markers based on real data
  const addReportMarkers = (map) => {
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    filteredReports.forEach((report) => {
      if (!report.location?.coordinates?.lat || !report.location?.coordinates?.lng) return;

      const coords = [
        report.location.coordinates.lng,
        report.location.coordinates.lat,
      ];

      const color = getMarkerColor(report.status);
      const categoryIcon = getMarkerIcon(report.category);

      const popupContent = `
        <div style="min-width: 280px;">
          <h3 style="margin:0 0 8px 0;font-size:14px;color:#dc2626;font-weight:bold;">
            ${report.title}
          </h3>
          <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
            <strong>Location:</strong> ${report.location.address || 'No address provided'}
          </p>
          <p style="margin:0 0 6px 0;font-size:13px;color:#374151;">
            <strong>Municipality:</strong> ${report.municipalityId?.name || 'Unknown Municipality'}
          </p>
          <p style="margin:0 0 6px 0;font-size:12px;color:#6b7280;line-height:1.4;">
            ${report.description}
          </p>
          <div style="display: flex; gap: 8px; margin: 8px 0;">
            <span style="font-size:11px;padding:2px 8px;background:${color}20;color:${color};border-radius:4px;">
              ${report.status}
            </span>
            <span style="font-size:11px;padding:2px 8px;background:#f3f4f6;border-radius:4px;">
              ${report.category}
            </span>
            <span style="font-size:11px;padding:2px 8px;background:#f3f4f6;border-radius:4px;">
              ${report.priority || 'Medium'} Priority
            </span>
          </div>
          <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 8px;">
            <span style="font-size:11px;color:#9ca3af;">
              Reported: ${new Date(report.createdAt).toLocaleDateString()}
            </span>
            ${report.citizenId?.name ? `
              <span style="font-size:11px;color:#374151;">
                By: ${report.citizenId.name}
              </span>
            ` : ''}
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({ 
        color: color,
        draggable: false
      })
        .setLngLat(coords)
        .setPopup(new maplibregl.Popup({ offset: 25, maxWidth: '300px' }).setHTML(popupContent))
        .addTo(map);

      marker.getElement().addEventListener("click", () => {
        map.flyTo({ 
          center: coords, 
          zoom: 14,
          speed: 1.2,
          curve: 1.5,
          easing: (t) => t,
          essential: true 
        });
        setTimeout(() => marker.togglePopup(), 1000);
        setSelectedReport(report);
      });

      markersRef.current.push(marker);
    });
  };

  // Fly to report location
  const flyToLocation = (coords, report) => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo({ 
        center: coords, 
        zoom: 14,
        speed: 1.2,
        curve: 1.5,
        easing: (t) => t,
        essential: true 
      });
      setTimeout(() => {
        const marker = markersRef.current.find(m => {
          const markerCoords = m.getLngLat();
          return markerCoords.lng === coords[0] && markerCoords.lat === coords[1];
        });
        if (marker) {
          marker.togglePopup();
        }
      }, 1500);
      setSelectedReport(report);
    }
  };

  // Zoom controls
  const zoomIn = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomIn();
    }
  };

  const zoomOut = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.zoomOut();
    }
  };

  const resetView = () => {
    if (mapInstanceRef.current && reports.length > 0) {
      const center = calculateCenter(reports);
      mapInstanceRef.current.flyTo({
        center: center,
        zoom: 10,
        duration: 1000
      });
    }
  };

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Loading state
  if (isLoadingMunicipalities || isLoadingReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Map Data</h2>
          <p className="text-gray-600">Fetching municipalities and reports from server...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isErrorMunicipalities || isErrorReports) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">Unable to fetch data from server</p>
          <button
            onClick={() => {
              refetchMunicipalities();
              refetchReports();
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center mx-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Retry Loading
          </button>
        </div>
      </div>
    );
  }

  // Main render with CSS
  return (
    <>
      <style>{`
        body, html { 
          margin:0; 
          padding:0; 
          overflow:hidden; 
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #map { 
          width:100%; 
          height:100vh; 
          position:absolute; 
          top:0; 
          left:0; 
        }
        .controls { 
          position:absolute; 
          top:20px; 
          left:20px; 
          z-index:1000; 
          background:white; 
          padding:20px; 
          border-radius:12px; 
          box-shadow:0 4px 12px rgba(0,0,0,0.15); 
          max-height:85vh; 
          overflow-y:auto;
          width: 320px;
        }
        .controls h3 { 
          margin:0 0 20px 0; 
          font-size:18px; 
          color:#1f2937; 
          border-bottom:3px solid #3b82f6; 
          padding-bottom:12px;
          font-weight: 600;
        }
        .report-card { 
          background:#ffffff; 
          border:1px solid #e5e7eb; 
          border-radius:8px; 
          padding:16px; 
          margin:10px 0; 
          cursor:pointer; 
          transition:all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .report-card:hover { 
          background:#f0f9ff; 
          border-color:#3b82f6; 
          transform:translateX(4px);
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        .report-card h4 { 
          margin:0 0 8px 0; 
          font-size:14px; 
          color:#dc2626; 
          font-weight:bold;
          line-height: 1.4;
        }
        .report-card p { 
          margin:0 0 6px 0; 
          font-size:12px; 
          color:#4b5563;
          line-height: 1.5;
        }
        .report-card .location { 
          color:#3b82f6; 
          font-weight:500;
          font-size: 13px;
        }
        .report-card .municipality { 
          color:#10b981; 
          font-weight:500;
          font-size: 12px;
          margin-top: 4px;
        }
        .report-card .meta { 
          color:#6b7280;
          font-size: 11px;
          margin-top: 8px;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .loading-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(255,255,255,0.9);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          font-size: 16px;
          color: #374151;
          font-weight: 500;
        }
        .legend {
          position: absolute;
          bottom: 20px;
          right: 20px;
          background: white;
          padding: 15px;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          z-index: 1000;
        }
        .legend h4 {
          margin: 0 0 10px 0;
          font-size: 14px;
          color: #1f2937;
        }
        .legend-item {
          display: flex;
          align-items: center;
          margin: 5px 0;
          font-size: 12px;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .map-controls {
          position: absolute;
          bottom: 20px;
          left: 20px;
          display: flex;
          gap: 8px;
          z-index: 1000;
        }
        .control-button {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 6px;
          padding: 8px;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
          transition: all 0.2s;
        }
        .control-button:hover {
          background: #f9fafb;
          transform: translateY(-1px);
        }
        .status-badge {
          display: inline-flex;
          align-items: center;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          margin-right: 6px;
        }
        .selected-report {
          position: absolute;
          top: 20px;
          right: 20px;
          z-index: 1000;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
          width: 300px;
          max-height: 80vh;
          overflow-y: auto;
        }
      `}</style>

      {loading && (
        <div className="loading-overlay">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mr-3" />
          Initializing map...
        </div>
      )}

      <div className="controls">
        <div className="flex items-center justify-between mb-4">
          <h3>📍 Recent Reports ({reports.length})</h3>
          <button
            onClick={() => {
              refetchMunicipalities();
              refetchReports();
            }}
            className="p-1 hover:bg-gray-100 rounded-lg"
            title="Refresh data"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <div className="mb-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>
                    {cat.icon} {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {filteredReports.length === 0 ? (
          <div className="text-center py-8">
            <MapPin className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No reports found</p>
          </div>
        ) : (
          filteredReports.map((report) => {
            const coords = report.location?.coordinates 
              ? [report.location.coordinates.lng, report.location.coordinates.lat]
              : null;
            
            return (
              <div
                key={report._id}
                className={`report-card ${!coords ? 'opacity-50 cursor-not-allowed' : ''}`}
                onClick={() => coords && flyToLocation(coords, report)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h4>{report.title}</h4>
                  <span 
                    className="status-badge"
                    style={{ 
                      background: `${getMarkerColor(report.status)}20`,
                      color: getMarkerColor(report.status)
                    }}
                  >
                    {report.status}
                  </span>
                </div>
                <p className="location">
                  📌 {report.location?.address || 'No address'}
                </p>
                <p className="municipality">
                  🏛️ {report.municipalityId?.name || 'Unknown Municipality'}
                </p>
                <p>{report.description?.substring(0, 70)}...</p>
                <div className="meta">
                  <span>📅 {new Date(report.createdAt).toLocaleDateString()}</span>
                  <span style={{ color: getMarkerColor(report.category) }}>
                    {report.category}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="legend">
        <h4>Map Legend</h4>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#dc2626' }}></div>
          <span>Report Location</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ backgroundColor: '#1d4ed8' }}></div>
          <span>Municipality Center</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ 
            backgroundColor: '#3b82f6',
            opacity: 0.3,
            border: '1px dashed #1d4ed8'
          }}></div>
          <span>Municipality Boundary</span>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <h5 className="text-xs font-medium text-gray-700 mb-2">Status Colors:</h5>
          {statusOptions.slice(1).map(option => (
            <div key={option.value} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: getMarkerColor(option.value) }}
              ></div>
              <span className="text-xs">{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="map-controls">
        <button onClick={zoomIn} className="control-button" title="Zoom In">
          <ZoomIn className="w-5 h-5" />
        </button>
        <button onClick={zoomOut} className="control-button" title="Zoom Out">
          <ZoomOut className="w-5 h-5" />
        </button>
        <button onClick={resetView} className="control-button" title="Reset View">
          <Navigation className="w-5 h-5" />
        </button>
        <button onClick={toggleFullscreen} className="control-button" title="Toggle Fullscreen">
          {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
        </button>
      </div>

      {selectedReport && (
        <div className="selected-report">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900">Report Details</h3>
            <button
              onClick={() => setSelectedReport(null)}
              className="p-1 hover:bg-gray-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900">{selectedReport.title}</h4>
              <div className="flex gap-2 mt-2">
                <span 
                  className="status-badge"
                  style={{ 
                    background: `${getMarkerColor(selectedReport.status)}20`,
                    color: getMarkerColor(selectedReport.status)
                  }}
                >
                  {selectedReport.status}
                </span>
                <span className="status-badge bg-gray-100 text-gray-700">
                  {selectedReport.category}
                </span>
                <span className="status-badge bg-gray-100 text-gray-700">
                  {selectedReport.priority || 'Medium'} Priority
                </span>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600">{selectedReport.description}</p>
            </div>

            <div className="bg-gray-50 rounded-lg p-4">
              <h5 className="font-medium text-gray-900 mb-2 flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-blue-500" />
                Location Details
              </h5>
              <p className="text-sm text-gray-700">{selectedReport.location?.address || 'No address'}</p>
              {selectedReport.location?.ward && (
                <p className="text-xs text-gray-500 mt-1">Ward: {selectedReport.location.ward}</p>
              )}
              {selectedReport.location?.coordinates && (
                <div className="grid grid-cols-2 gap-2 text-xs mt-2">
                  <div>
                    <span className="text-gray-500">Lat:</span>
                    <p className="font-mono">{selectedReport.location.coordinates.lat}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Lng:</span>
                    <p className="font-mono">{selectedReport.location.coordinates.lng}</p>
                  </div>
                </div>
              )}
            </div>

            {selectedReport.citizenId && (
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium mr-3">
                  {selectedReport.citizenId.name?.charAt(0) || 'C'}
                </div>
                <div>
                  <p className="font-medium text-gray-900">{selectedReport.citizenId.name}</p>
                  <p className="text-xs text-gray-600">Citizen Reporter</p>
                </div>
              </div>
            )}

            <div className="border-t pt-4">
              <button
                onClick={() => {
                  navigate(`/reports/${selectedReport._id}`);
                }}
                className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 mb-2"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      )}

      <div id="map" ref={mapContainerRef}></div>
    </>
  );
}

export default MapView;