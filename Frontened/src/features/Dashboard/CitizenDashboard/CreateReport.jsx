import React, { useState } from 'react'
import { 
  AlertTriangle,
  Camera,
  Video,
  MapPin,
  Calendar,
  X,
  Loader2
} from 'lucide-react'

const ReportForm = ({ 
  onSubmit, 
  onCancel, 
  userLocation = { lat: 27.7172, lng: 85.3240 },
  municipalityId = '' 
}) => {
  const [loading, setLoading] = useState(false)
  const [location, setLocation] = useState({
    lat: userLocation.lat,
    lng: userLocation.lng,
    address: ''
  })
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road',
    priority: 'medium',
    severity: 'medium',
    photos: [],
    videos: []
  })

  const categories = [
    { value: 'road', label: 'Road Issues' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'water', label: 'Water Supply' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'safety', label: 'Safety' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'illegal_activity', label: 'Illegal Activity' }
  ]

  // Use a simple static map image instead of Leaflet
  const getStaticMapUrl = (lat, lng) => {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=15&size=600x300&maptype=roadmap&markers=color:red%7C${lat},${lng}&key=YOUR_GOOGLE_MAPS_API_KEY`
  }

  const updateLocation = (lat, lng) => {
    setLocation(prev => ({ ...prev, lat, lng }))
  }

  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setLocation(prev => ({ ...prev, lat: latitude, lng: longitude }))
        },
        (error) => {
          alert('Please enable location access or enter coordinates manually.')
        }
      )
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files)
    const fileUrls = files.map(file => URL.createObjectURL(file))
    
    setFormData(prev => ({
      ...prev,
      [type]: [...prev[type], ...fileUrls]
    }))
  }

  const removeFile = (index, type) => {
    setFormData(prev => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index)
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const reportData = {
        ...formData,
        location: {
          address: location.address,
          coordinates: { lat: location.lat, lng: location.lng },
          ward: ''
        },
        municipalityId,
        citizenId: localStorage.getItem('userId'),
        status: 'pending',
        pointsAwarded: 10
      }

      if (onSubmit) {
        await onSubmit(reportData)
      }
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Report an Issue</h1>
          <p className="text-gray-600 mt-1">Help improve your community</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div className="bg-white p-4 rounded-lg border">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="Issue Title *"
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Description */}
          <div className="bg-white p-4 rounded-lg border">
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Detailed Description *"
              rows={4}
              className="w-full p-3 border rounded-lg"
              required
            />
          </div>

          {/* Category */}
          <div className="bg-white p-4 rounded-lg border">
            <label className="block mb-3 font-medium">Category *</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="w-full p-3 border rounded-lg"
            >
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Location */}
          <div className="bg-white p-4 rounded-lg border">
            <div className="flex justify-between items-center mb-3">
              <label className="font-medium">Location *</label>
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="flex items-center text-blue-600 text-sm"
              >
                <MapPin className="w-4 h-4 mr-1" />
                Use Current Location
              </button>
            </div>
            
            {/* Simple static map or coordinates input */}
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    value={location.lat}
                    onChange={(e) => updateLocation(parseFloat(e.target.value), location.lng)}
                    className="w-full p-2 border rounded"
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    value={location.lng}
                    onChange={(e) => updateLocation(location.lat, parseFloat(e.target.value))}
                    className="w-full p-2 border rounded"
                  />
                </div>
              </div>
              
              {/* Address */}
              <div>
                <label className="block text-sm mb-1">Address (Optional)</label>
                <input
                  type="text"
                  value={location.address}
                  onChange={(e) => setLocation(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Enter address"
                  className="w-full p-2 border rounded"
                />
              </div>
            </div>
          </div>

          {/* Priority & Severity */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <label className="block mb-2 font-medium">Priority</label>
              <select
                name="priority"
                value={formData.priority}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            
            <div className="bg-white p-4 rounded-lg border">
              <label className="block mb-2 font-medium">Severity</label>
              <select
                name="severity"
                value={formData.severity}
                onChange={handleInputChange}
                className="w-full p-3 border rounded-lg"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-3 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ReportForm