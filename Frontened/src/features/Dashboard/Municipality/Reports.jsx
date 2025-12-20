import React, { useState } from 'react'
import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Calendar,
  Award,
  User,
  Filter,
  Search,
  ChevronDown,
  Image as ImageIcon,
  Video,
  Building,
  Eye,
  Edit3,
  MoreVertical,
  Download,
  Printer,
  Shield,
  TrendingUp,
  AlertCircle,
  Loader2
} from 'lucide-react'
import { useGetReportsQuery } from '../../../store/api/reportApi'

const MunicipalityReports = () => {
  const { data: reportsData, isLoading, isError, refetch } = useGetReportsQuery()
  console.log(reportsData);
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedReport, setSelectedReport] = useState(null)

  const reports = reportsData?.data || []
  const totalReports = reportsData?.pagination?.total || 0

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', color: 'gray' },
    { value: 'pending', label: 'Pending', color: 'yellow', icon: Clock },
    { value: 'assigned', label: 'Assigned', color: 'blue', icon: User },
    { value: 'in_progress', label: 'In Progress', color: 'orange', icon: AlertTriangle },
    { value: 'resolved', label: 'Resolved', color: 'green', icon: CheckCircle }
  ]

  // Category options based on data
  const categoryOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'road', label: 'Road Issues', icon: '🚧' },
    { value: 'electricity', label: 'Electricity', icon: '⚡' },
    { value: 'water', label: 'Water Supply', icon: '💧' },
    { value: 'sanitation', label: 'Sanitation', icon: '🧹' },
    { value: 'safety', label: 'Safety', icon: '🛡️' },
    { value: 'emergency', label: 'Emergency', icon: '🚨' },
    { value: 'illegal_activity', label: 'Illegal Activity', icon: '🚫' }
  ]

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      const matchesSearch = searchQuery === '' || 
        report.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.location?.address?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter
      
      return matchesSearch && matchesStatus && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 }
          return priorityOrder[b.priority] - priorityOrder[a.priority]
        case 'severity':
          const severityOrder = { emergency: 4, high: 3, medium: 2, low: 1 }
          return severityOrder[b.severity] - severityOrder[a.severity]
        default:
          return 0
      }
    })

  // Get status color and icon
  const getStatusConfig = (status) => {
    const option = statusOptions.find(opt => opt.value === status)
    return {
      color: option?.color || 'gray',
      icon: option?.icon || AlertCircle,
      label: option?.label || status
    }
  }

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 border-red-200'
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  // Get category icon
  const getCategoryIcon = (category) => {
    const cat = categoryOptions.find(c => c.value === category)
    return cat?.icon || '📋'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Get time ago
  const getTimeAgo = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return `${Math.floor(diffDays / 7)}w ago`
  }

  // Stats calculation
  const stats = {
    total: totalReports,
    pending: reports.filter(r => r.status === 'pending').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
    urgent: reports.filter(r => r.priority === 'urgent').length
  }

  // Handle view report details
  const handleViewReport = (report) => {
    setSelectedReport(report)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading reports...</p>
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load reports</h3>
          <p className="text-gray-600 mb-4">Unable to fetch reports data</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Municipality Reports</h1>
            <p className="text-gray-600 mt-1">
              Manage and track all citizen reports in your municipality
            </p>
          </div>
          <div className="flex items-center space-x-3 mt-4 md:mt-0">
            <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
              <Printer className="w-4 h-4 mr-2" />
              Export
            </button>
            <button className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Reports</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pending}</p>
              </div>
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-gray-900">{stats.inProgress}</p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Resolved</p>
                <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
              </div>
              <div className="p-2 bg-green-50 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Urgent</p>
                <p className="text-2xl font-bold text-gray-900">{stats.urgent}</p>
              </div>
              <div className="p-2 bg-red-50 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Controls */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              {categoryOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.icon} {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="severity">Severity (High to Low)</option>
            </select>
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredReports.length} of {totalReports} reports
            {searchQuery && ` for "${searchQuery}"`}
          </div>
          
          <button
            onClick={() => {
              setSearchQuery('')
              setStatusFilter('all')
              setCategoryFilter('all')
              setSortBy('newest')
            }}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Reports List */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {filteredReports.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Found</h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
                ? 'No reports match your filters. Try adjusting your search.'
                : 'No reports have been submitted yet.'
              }
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredReports.map((report) => {
              const statusConfig = getStatusConfig(report.status)
              const StatusIcon = statusConfig.icon
              const citizen = report.citizenId
              
              return (
                <div key={report._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    {/* Left Column - Report Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getCategoryIcon(report.category)}</span>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {report.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium bg-${statusConfig.color}-100 text-${statusConfig.color}-800 border border-${statusConfig.color}-200`}>
                                <StatusIcon className="w-3 h-3 inline mr-1" />
                                {statusConfig.label}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                                {report.priority}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-gray-600 mb-3 line-clamp-2">
                        {report.description}
                      </p>

                      {/* Citizen Info */}
                      <div className="flex items-center gap-4 mb-3">
                        {citizen && (
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium text-sm mr-2">
                              {citizen.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">{citizen.name}</p>
                              <p className="text-xs text-gray-500">Citizen</p>
                            </div>
                          </div>
                        )}

                        {/* Location */}
                        {report.location?.address && (
                          <div className="flex items-center text-sm text-gray-500">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span className="truncate max-w-xs">
                              {report.location.address}
                              {report.location.ward && ` • Ward ${report.location.ward}`}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {getTimeAgo(report.createdAt)}
                        </div>
                        
                        {report.pointsAwarded > 0 && (
                          <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-medium">
                            <Award className="w-4 h-4 mr-1" />
                            +{report.pointsAwarded} points
                          </div>
                        )}

                        {report.photos?.length > 0 && (
                          <div className="flex items-center">
                            <ImageIcon className="w-4 h-4 mr-1" />
                            {report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        {report.videos?.length > 0 && (
                          <div className="flex items-center">
                            <Video className="w-4 h-4 mr-1" />
                            {report.videos.length} video{report.videos.length !== 1 ? 's' : ''}
                          </div>
                        )}

                        {report.validationInfo?.locationValidated && (
                          <div className="flex items-center text-green-600">
                            <Shield className="w-4 h-4 mr-1" />
                            Location Verified
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Column - Actions */}
                    <div className="flex items-center gap-3 lg:flex-shrink-0">
                      <button
                        onClick={() => handleViewReport(report)}
                        className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>
                      
                      <button
                        onClick={() => console.log('Edit report:', report._id)}
                        className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                      >
                        <Edit3 className="w-4 h-4 mr-2" />
                        Assign
                      </button>

                      <div className="relative">
                        <button className="p-2 hover:bg-gray-100 rounded-lg">
                          <MoreVertical className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{getCategoryIcon(selectedReport.category)}</span>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h2>
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        selectedReport.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        selectedReport.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                        selectedReport.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {selectedReport.status.replace('_', ' ')}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedReport.priority)}`}>
                        {selectedReport.priority} Priority
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 whitespace-pre-line">{selectedReport.description}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Citizen Details</h3>
                    {selectedReport.citizenId && (
                      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white font-medium text-lg">
                          {selectedReport.citizenId.name?.charAt(0) || 'C'}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedReport.citizenId.name}</p>
                          <p className="text-sm text-gray-600">Citizen</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Location Details</h3>
                    <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                      {selectedReport.location?.address && (
                        <div className="flex items-start">
                          <MapPin className="w-5 h-5 text-gray-500 mr-2 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Address</p>
                            <p className="text-gray-900">{selectedReport.location.address}</p>
                          </div>
                        </div>
                      )}
                      {selectedReport.location?.ward && (
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-gray-500 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-sm text-gray-600">Ward</p>
                            <p className="text-gray-900">Ward {selectedReport.location.ward}</p>
                          </div>
                        </div>
                      )}
                      {selectedReport.location?.coordinates && (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <p className="text-sm text-gray-600">Latitude</p>
                            <p className="font-mono text-gray-900">{selectedReport.location.coordinates.lat}</p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-600">Longitude</p>
                            <p className="font-mono text-gray-900">{selectedReport.location.coordinates.lng}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Report Metadata</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Reported On</p>
                        <p className="text-gray-900">{formatDate(selectedReport.createdAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Last Updated</p>
                        <p className="text-gray-900">{formatDate(selectedReport.updatedAt)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Severity</p>
                        <p className="text-gray-900 capitalize">{selectedReport.severity}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Category</p>
                        <p className="text-gray-900 capitalize">{selectedReport.category}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <button className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Assign to Staff
                  </button>
                  <button className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                    Update Status
                  </button>
                </div>
                <div className="flex items-center space-x-3">
                  <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination (if needed) */}
      {filteredReports.length > 0 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Page 1 of {reportsData?.pagination?.pages || 1}
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Previous
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MunicipalityReports