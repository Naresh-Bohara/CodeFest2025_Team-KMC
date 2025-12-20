import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  AlertTriangle,
  Camera,
  Video,
  MapPin,
  ChevronRight,
  ChevronLeft,
  Send,
  X,
  Loader2,
  Upload,
  AlertCircle,
  CheckCircle,
  Shield,
  Building
} from 'lucide-react'
import 'leaflet/dist/leaflet.css'
import { useCreateReportMutation } from '../../../store/api/reportApi'
import { useSelector } from 'react-redux'
import { selectCurrentUser } from '../../../store/slices/authSlice'

const ReportForm = () => {
  const navigate = useNavigate()
  const [createReport, { isLoading, isSuccess, error }] = useCreateReportMutation()
  const [step, setStep] = useState(1)
  const [selectedCoordinates, setSelectedCoordinates] = useState(null)
  const [address, setAddress] = useState('')
  const [ward, setWard] = useState('')
  const [photos, setPhotos] = useState([])
  const [videos, setVideos] = useState([])
  const [previewUrls, setPreviewUrls] = useState([])
  const [videoPreviewUrls, setVideoPreviewUrls] = useState([])
  const mapRef = useRef(null)
  const [leafletLoaded, setLeafletLoaded] = useState(false)
  const user = useSelector(selectCurrentUser)

  // Lazy load Leaflet only when needed
  useEffect(() => {
    if (step === 2 && !leafletLoaded) {
      import('leaflet').then((L) => {
        delete L.Icon.Default.prototype._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
        })
        setLeafletLoaded(true)
      })
    }
  }, [step])

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'road',
    severity: 'medium',
    priority: 'medium'
  })

  const categories = [
    { value: 'road', label: 'Road Issues', icon: '🚧', color: 'bg-orange-100' },
    { value: 'electricity', label: 'Electricity', icon: '⚡', color: 'bg-yellow-100' },
    { value: 'water', label: 'Water Supply', icon: '💧', color: 'bg-blue-100' },
    { value: 'sanitation', label: 'Sanitation', icon: '🧹', color: 'bg-teal-100' },
    { value: 'safety', label: 'Safety', icon: '🛡️', color: 'bg-red-100' },
    { value: 'emergency', label: 'Emergency', icon: '🚨', color: 'bg-red-200' },
    { value: 'illegal_activity', label: 'Illegal Activity', icon: '🚫', color: 'bg-purple-100' }
  ]

  const severities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'emergency', label: 'Emergency', color: 'bg-red-100 text-red-800' }
  ]

  const priorities = [
    { value: 'low', label: 'Low', color: 'bg-green-100 text-green-800' },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
    { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' }
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleCategorySelect = (category) => {
    setFormData(prev => ({ ...prev, category }))
  }

  const handleSeveritySelect = (severity) => {
    setFormData(prev => ({ ...prev, severity }))
  }

  const handlePrioritySelect = (priority) => {
    setFormData(prev => ({ ...prev, priority }))
  }

  // Handle file uploads
  const handleFileUpload = (e, type) => {
    const files = Array.from(e.target.files)
    
    if (type === 'photos') {
      if (photos.length + files.length > 5) {
        alert('Maximum 5 photos allowed')
        return
      }
      
      const newPhotos = [...photos, ...files]
      setPhotos(newPhotos)
      
      const newPreviewUrls = files.map(file => URL.createObjectURL(file))
      setPreviewUrls(prev => [...prev, ...newPreviewUrls])
    } else {
      if (videos.length + files.length > 2) {
        alert('Maximum 2 videos allowed')
        return
      }
      
      const newVideos = [...videos, ...files]
      setVideos(newVideos)
      
      const newVideoUrls = files.map(file => URL.createObjectURL(file))
      setVideoPreviewUrls(prev => [...prev, ...newVideoUrls])
    }
  }

  const removeFile = (index, type) => {
    if (type === 'photos') {
      const newPhotos = [...photos]
      newPhotos.splice(index, 1)
      setPhotos(newPhotos)
      
      URL.revokeObjectURL(previewUrls[index])
      const newUrls = [...previewUrls]
      newUrls.splice(index, 1)
      setPreviewUrls(newUrls)
    } else {
      const newVideos = [...videos]
      newVideos.splice(index, 1)
      setVideos(newVideos)
      
      URL.revokeObjectURL(videoPreviewUrls[index])
      const newUrls = [...videoPreviewUrls]
      newUrls.splice(index, 1)
      setVideoPreviewUrls(newUrls)
    }
  }

  // Clean up preview URLs
  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url))
      videoPreviewUrls.forEach(url => URL.revokeObjectURL(url))
    }
  }, [])

  // Get current location
  const handleGetCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords
          setSelectedCoordinates({ lat: latitude, lng: longitude })
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setAddress(data.display_name)
              }
            })
        },
        (error) => {
          alert('Please enable location access or select from map.')
        }
      )
    }
  }

  // CORRECTED Submit form - matches Postman format
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedCoordinates) {
      alert('Please select a location on the map')
      return
    }
    
    if (formData.description.length < 10) {
      alert('Description must be at least 10 characters long')
      return
    }
    
    if (!user?.municipalityId) {
      alert('Your account is not assigned to any municipality. Please contact support.')
      return
    }
    
    try {
      // Create FormData - format exactly like Postman
      const submitFormData = new FormData()
      
      // Add basic fields
      submitFormData.append('title', formData.title)
      submitFormData.append('description', formData.description)
      submitFormData.append('category', formData.category)
      submitFormData.append('severity', formData.severity)
      submitFormData.append('priority', formData.priority)
      submitFormData.append('municipalityId', user.municipalityId)
      
      // Add location fields in POSTMAN format (nested brackets)
      // This creates: location[address], location[ward], location[coordinates][lat], location[coordinates][lng]
      submitFormData.append('location[address]', address || '')
      submitFormData.append('location[ward]', ward || '')
      submitFormData.append('location[coordinates][lat]', selectedCoordinates.lat.toString())
      submitFormData.append('location[coordinates][lng]', selectedCoordinates.lng.toString())
      
      // Add files
      photos.forEach(photo => {
        submitFormData.append('photos', photo)
      })
      
      videos.forEach(video => {
        submitFormData.append('videos', video)
      })
      
      // Debug: Show what we're sending
      console.log('Submitting report with FormData entries:')
      for (let [key, value] of submitFormData.entries()) {
        console.log(key, ':', value)
      }
      
      // Make API call
      await createReport(submitFormData).unwrap()
      
      // Navigate to reports page
      setTimeout(() => {
        navigate('/reports')
      }, 1000)
      
    } catch (error) {
      console.error('Failed to create report:', error)
      
      if (error.data) {
        const errorDetail = error.data.detail || {}
        let errorMessage = 'Validation failed:\n'
        
        Object.keys(errorDetail).forEach(key => {
          errorMessage += `• ${key}: ${errorDetail[key]}\n`
        })
        
        alert(errorMessage)
      } else {
        alert(error.data?.message || 'Failed to create report. Please try again.')
      }
    }
  }

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Report Details
        </h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Brief description of the issue"
              required
              minLength={5}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 min-h-[120px]"
              placeholder="Provide detailed information about the issue..."
              required
              minLength={10}
            />
            <div className={`text-xs mt-1 ${formData.description.length < 10 ? 'text-red-500' : 'text-green-500'}`}>
              {formData.description.length}/10 characters (minimum 10 required)
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Category *
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {categories.map(cat => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => handleCategorySelect(cat.value)}
                  className={`p-4 rounded-lg border ${formData.category === cat.value ? 'border-teal-500 ring-2 ring-teal-200' : 'border-gray-200'} ${cat.color} transition-all hover:shadow-md`}
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <span className="text-sm font-medium text-gray-800">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Severity
              </label>
              <div className="space-y-2">
                {severities.map(sev => (
                  <button
                    key={sev.value}
                    type="button"
                    onClick={() => handleSeveritySelect(sev.value)}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium ${formData.severity === sev.value ? 'ring-2 ring-teal-500' : ''} ${sev.color} border border-gray-200`}
                  >
                    {sev.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              <div className="space-y-2">
                {priorities.map(pri => (
                  <button
                    key={pri.value}
                    type="button"
                    onClick={() => handlePrioritySelect(pri.value)}
                    className={`w-full px-4 py-2.5 rounded-lg text-sm font-medium ${formData.priority === pri.value ? 'ring-2 ring-teal-500' : ''} ${pri.color} border border-gray-200`}
                  >
                    {pri.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Step 2: Location
  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <MapPin className="w-5 h-5 mr-2 text-teal-500" />
          Select Location
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          Click on the map to mark the exact location of the issue or use your current location
        </p>
        
        {/* Map Container - will be populated by Leaflet */}
        <div 
          id="map" 
          className="w-full h-80 rounded-lg border border-gray-300 bg-gray-100 mb-4"
          ref={mapRef}
        >
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-3" />
              <p className="text-sm text-gray-600">Loading map...</p>
            </div>
          </div>
        </div>
        
        {/* Current Location Button */}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          className="w-full mb-4 px-4 py-3 bg-teal-50 text-teal-700 rounded-lg border border-teal-200 hover:bg-teal-100 flex items-center justify-center font-medium"
        >
          <MapPin className="w-5 h-5 mr-2" />
          Use Current Location
        </button>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="Enter detailed address"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ward Number (Optional)
            </label>
            <input
              type="text"
              value={ward}
              onChange={(e) => setWard(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="e.g., 5"
            />
          </div>
          
          {selectedCoordinates && (
            <div className="p-4 bg-teal-50 rounded-lg border border-teal-200">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-teal-500 mr-2" />
                <div>
                  <p className="text-sm font-medium text-teal-700">Location Selected</p>
                  <p className="text-sm text-teal-600">
                    Coordinates: {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )

  // Step 3: Media Upload
  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Add Evidence
        </h3>
        
        <p className="text-sm text-gray-600 mb-6">
          Upload photos and videos as evidence. Maximum 5 photos and 2 videos.
        </p>
        
        {/* Photos Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center">
                <Camera className="w-5 h-5 mr-2 text-teal-500" />
                Photos ({photos.length}/5)
              </h4>
              <p className="text-sm text-gray-500">JPEG, PNG, WebP up to 5MB each</p>
            </div>
            <div>
              <label className="px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 cursor-pointer font-medium inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Add Photos
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'photos')}
                  className="hidden"
                  disabled={photos.length >= 5}
                />
              </label>
            </div>
          </div>
          
          {previewUrls.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index, 'photos')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2 truncate">{photos[index].name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Camera className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No photos added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add photos to provide visual evidence</p>
            </div>
          )}
        </div>
        
        {/* Videos Section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h4 className="font-medium text-gray-900 flex items-center">
                <Video className="w-5 h-5 mr-2 text-teal-500" />
                Videos ({videos.length}/2)
              </h4>
              <p className="text-sm text-gray-500">MP4, MPEG, MOV up to 50MB each</p>
            </div>
            <div>
              <label className="px-4 py-2.5 bg-teal-500 text-white rounded-lg hover:bg-teal-600 cursor-pointer font-medium inline-flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Add Videos
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={(e) => handleFileUpload(e, 'videos')}
                  className="hidden"
                  disabled={videos.length >= 2}
                />
              </label>
            </div>
          </div>
          
          {videoPreviewUrls.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {videoPreviewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <video
                    src={url}
                    className="w-full h-48 object-cover rounded-lg"
                    controls
                  />
                  <button
                    type="button"
                    onClick={() => removeFile(index, 'videos')}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-full hover:bg-red-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <p className="text-xs text-gray-500 mt-2 truncate">{videos[index].name}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
              <Video className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No videos added yet</p>
              <p className="text-sm text-gray-400 mt-1">Add videos to show dynamic evidence</p>
            </div>
          )}
        </div>
        
        {/* Note for emergency reports */}
        {formData.severity === 'emergency' && (
          <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700">Important Note for Emergency Reports</p>
                <p className="text-sm text-red-600 mt-1">
                  Emergency reports require photo/video evidence. Please upload at least one image or video.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  // Step 4: Review & Submit
  const renderStep4 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Review & Submit
        </h3>
        
        <div className="space-y-4">
          {/* Report Details */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-medium text-gray-900 mb-3">Report Details</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Title:</span>
                <span className="text-sm font-medium text-gray-900">{formData.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Category:</span>
                <span className="text-sm font-medium text-gray-900">
                  {categories.find(c => c.value === formData.category)?.label}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Severity:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{formData.severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Priority:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">{formData.priority}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-1">Description:</span>
                <p className="text-sm text-gray-900 bg-white p-3 rounded border">{formData.description}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length}/10 characters
                </p>
              </div>
            </div>
          </div>
          
          {/* Location */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-medium text-gray-900 mb-3 flex items-center">
              <MapPin className="w-4 h-4 mr-2" />
              Location
            </h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Address:</span>
                <span className="text-sm font-medium text-gray-900 text-right">{address || 'Not provided'}</span>
              </div>
              {ward && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Ward:</span>
                  <span className="text-sm font-medium text-gray-900">{ward}</span>
                </div>
              )}
              {selectedCoordinates && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Coordinates:</span>
                  <span className="text-sm font-mono text-gray-900">
                    {selectedCoordinates.lat.toFixed(6)}, {selectedCoordinates.lng.toFixed(6)}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Media */}
          <div className="bg-gray-50 rounded-xl p-5">
            <h4 className="font-medium text-gray-900 mb-3">Media Evidence</h4>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Photos:</span>
                <span className="text-sm font-medium text-gray-900">{photos.length} uploaded</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Videos:</span>
                <span className="text-sm font-medium text-gray-900">{videos.length} uploaded</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Initialize map when step 2 is active and Leaflet is loaded
  useEffect(() => {
    if (step === 2 && leafletLoaded && mapRef.current) {
      import('leaflet').then((L) => {
        // Create map
        const map = L.map('map').setView([27.7172, 85.3240], 13)
        
        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors'
        }).addTo(map)
        
        // Add marker
        let marker = null
        
        // If we already have coordinates, place a marker
        if (selectedCoordinates) {
          marker = L.marker([selectedCoordinates.lat, selectedCoordinates.lng]).addTo(map)
          map.setView([selectedCoordinates.lat, selectedCoordinates.lng], 15)
        }
        
        // Add click handler
        map.on('click', (e) => {
          const { lat, lng } = e.latlng
          setSelectedCoordinates({ lat, lng })
          
          // Update or create marker
          if (marker) {
            marker.setLatLng([lat, lng])
          } else {
            marker = L.marker([lat, lng]).addTo(map)
          }
          
          // Reverse geocode to get address
          fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
              if (data.display_name) {
                setAddress(data.display_name)
              }
            })
            .catch(err => console.error('Geocoding error:', err))
        })
        
        // Store map reference
        mapRef.current._map = map
        
        // Cleanup
        return () => {
          if (mapRef.current._map) {
            mapRef.current._map.remove()
            mapRef.current._map = null
          }
        }
      })
    }
  }, [step, leafletLoaded])

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create New Report
          </h1>
          <p className="text-gray-600">
            Help improve your community by reporting issues
          </p>
          {user?.municipalityId && (
            <div className="mt-2 inline-flex items-center px-3 py-1 rounded-full bg-teal-50 text-teal-700 text-sm">
              <Building className="w-4 h-4 mr-1" />
              Reporting to Municipality ID: {user.municipalityId}
            </div>
          )}
        </div>
        
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            {[1, 2, 3, 4].map((stepNum) => (
              <div key={stepNum} className="flex flex-col items-center">
                <div className={`
                  w-10 h-10 rounded-full flex items-center justify-center font-medium
                  ${step >= stepNum 
                    ? 'bg-teal-500 text-white ring-4 ring-teal-100' 
                    : 'bg-gray-200 text-gray-400'
                  }
                `}>
                  {stepNum}
                </div>
                <span className="text-xs mt-2 font-medium text-gray-600">
                  {stepNum === 1 && 'Details'}
                  {stepNum === 2 && 'Location'}
                  {stepNum === 3 && 'Media'}
                  {stepNum === 4 && 'Review'}
                </span>
              </div>
            ))}
          </div>
          <div className="relative h-2 bg-gray-200 rounded-full">
            <div 
              className="absolute top-0 left-0 h-full bg-teal-500 rounded-full transition-all duration-300"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />
          </div>
        </div>
        
        {/* Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 mb-6">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          
          {/* Error Display */}
          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-sm text-red-700">{error.data?.message || 'An error occurred'}</p>
              </div>
            </div>
          )}
          
          {/* Success Message */}
          {isSuccess && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-sm text-green-700">Report submitted successfully!</p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep(step - 1)}
            disabled={step === 1}
            className="px-6 py-3 rounded-lg font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed text-teal-600 hover:text-teal-700"
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            Back
          </button>
          
          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              disabled={
                (step === 1 && (!formData.title || !formData.description || formData.description.length < 10)) ||
                (step === 2 && (!address || !selectedCoordinates))
              }
              className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isLoading || !user?.municipalityId}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 font-medium flex items-center shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : !user?.municipalityId ? (
                'No Municipality Assigned'
              ) : (
                <>
                  <Send className="w-5 h-5 mr-2" />
                  Submit Report
                </>
              )}
            </button>
          )}
        </div>
        
        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-start">
            <Shield className="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-700">Your Report is Secure</p>
              <p className="text-sm text-blue-600 mt-1">
                Your report will be securely submitted to the municipality. Emergency reports get priority attention.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReportForm