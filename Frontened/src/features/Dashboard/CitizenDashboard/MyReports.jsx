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
  Grid,
  List,
  Search,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  AlertCircle
} from 'lucide-react'

const CitizenReports = ({ reports = [], onViewReport, onCreateReport }) => {
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')
  const [expandedReport, setExpandedReport] = useState(null)

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending', color: 'yellow' },
    { value: 'assigned', label: 'Assigned', color: 'blue' },
    { value: 'in_progress', label: 'In Progress', color: 'orange' },
    { value: 'resolved', label: 'Resolved', color: 'green' }
  ]

  // Category options based on schema
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

  // Sort options
  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'priority', label: 'Priority (High to Low)' },
    { value: 'severity', label: 'Severity (High to Low)' }
  ]

  // Filter and sort reports
  const filteredReports = reports
    .filter(report => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        report.description.toLowerCase().includes(searchQuery.toLowerCase())
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || report.status === statusFilter
      
      // Category filter
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

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: Clock }
      case 'assigned': return { bg: 'bg-blue-100', text: 'text-blue-800', icon: User }
      case 'in_progress': return { bg: 'bg-orange-100', text: 'text-orange-800', icon: AlertTriangle }
      case 'resolved': return { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle }
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', icon: AlertCircle }
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
    const categoryItem = categoryOptions.find(cat => cat.value === category)
    return categoryItem?.icon || '📋'
  }

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Format time ago
  const formatTimeAgo = (dateString) => {
    if (!dateString) return ''
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now - date
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`
    return `${Math.floor(diffDays / 30)} months ago`
  }

  // Render grid view
  const renderGridView = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredReports.map((report) => {
        const statusColor = getStatusColor(report.status)
        const StatusIcon = statusColor.icon
        
        return (
          <div 
            key={report._id} 
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => onViewReport && onViewReport(report._id)}
          >
            {/* Report Header */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{getCategoryIcon(report.category)}</span>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {report.title}
                    </h3>
                  </div>
                  <div className="flex items-center space-x-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {report.status.replace('_', ' ')}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Description Preview */}
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {report.description}
              </p>

              {/* Location */}
              {report.location?.address && (
                <div className="flex items-center text-sm text-gray-500 mb-3">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{report.location.address}</span>
                </div>
              )}

              {/* Media Indicators */}
              <div className="flex items-center space-x-3 mb-3">
                {report.photos?.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <ImageIcon className="w-4 h-4 mr-1" />
                    <span>{report.photos.length} photo{report.photos.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
                {report.videos?.length > 0 && (
                  <div className="flex items-center text-sm text-gray-500">
                    <Video className="w-4 h-4 mr-1" />
                    <span>{report.videos.length} video{report.videos.length !== 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center text-sm text-gray-500">
                  <Calendar className="w-4 h-4 mr-1" />
                  {formatDate(report.createdAt)}
                </div>
                {report.pointsAwarded > 0 && (
                  <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-medium">
                    <Award className="w-4 h-4 mr-1" />
                    +{report.pointsAwarded}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )

  // Render list view
  const renderListView = () => (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {filteredReports.map((report, index) => {
        const statusColor = getStatusColor(report.status)
        const StatusIcon = statusColor.icon
        const isExpanded = expandedReport === report._id
        
        return (
          <div 
            key={report._id}
            className={`${index !== filteredReports.length - 1 ? 'border-b border-gray-200' : ''}`}
          >
            {/* Report Summary */}
            <div 
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => setExpandedReport(isExpanded ? null : report._id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center mb-1">
                    <span className="text-lg mr-2">{getCategoryIcon(report.category)}</span>
                    <h3 className="font-semibold text-gray-900 truncate">
                      {report.title}
                    </h3>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      <StatusIcon className="w-3 h-3 inline mr-1" />
                      {report.status.replace('_', ' ')}
                    </span>
                    
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(report.priority)}`}>
                      {report.priority}
                    </span>
                    
                    {report.location?.ward && (
                      <span className="px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                        Ward {report.location.ward}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 line-clamp-1">
                    {report.description}
                  </p>
                </div>
                
                <div className="flex items-center space-x-4 ml-4">
                  <div className="text-right">
                    <div className="text-sm text-gray-500">
                      {formatTimeAgo(report.createdAt)}
                    </div>
                    {report.pointsAwarded > 0 && (
                      <div className="flex items-center justify-end mt-1">
                        <Award className="w-4 h-4 text-amber-600 mr-1" />
                        <span className="text-sm font-medium text-amber-700">
                          +{report.pointsAwarded}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <button className="text-gray-400 hover:text-gray-600">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5" />
                    ) : (
                      <ChevronDown className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="px-4 pb-4 bg-gray-50 border-t border-gray-200">
                <div className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Description</h4>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Details</h4>
                      <div className="space-y-2">
                        {report.location?.address && (
                          <div className="flex items-start">
                            <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-600">{report.location.address}</span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            Reported: {formatDate(report.createdAt)}
                          </span>
                        </div>
                        
                        {report.dueDate && (
                          <div className="flex items-center">
                            <Clock className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-600">
                              Due: {formatDate(report.dueDate)}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <AlertTriangle className="w-4 h-4 text-gray-400 mr-2 flex-shrink-0" />
                          <span className="text-sm text-gray-600">
                            Severity: {report.severity}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Media Preview */}
                  {(report.photos?.length > 0 || report.videos?.length > 0) && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Media</h4>
                      <div className="flex flex-wrap gap-2">
                        {report.photos?.slice(0, 3).map((photo, idx) => (
                          <div key={idx} className="w-16 h-16 bg-gray-200 rounded overflow-hidden">
                            <img 
                              src={photo} 
                              alt={`Report photo ${idx + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        ))}
                        {report.videos?.length > 0 && (
                          <div className="flex items-center px-3 py-2 bg-gray-100 rounded text-sm text-gray-600">
                            <Video className="w-4 h-4 mr-1" />
                            {report.videos.length} video{report.videos.length !== 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-4 flex justify-end">
                    <button
                      onClick={() => onViewReport && onViewReport(report._id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Full Details
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )

  // Empty state
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        No Reports Found
      </h3>
      <p className="text-gray-600 mb-4 max-w-md mx-auto">
        {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
          ? 'Try adjusting your filters or search term'
          : 'You haven\'t submitted any reports yet'
        }
      </p>
      {onCreateReport && (
        <button
          onClick={onCreateReport}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Report Your First Issue
        </button>
      )}
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
          <p className="text-gray-600 mt-1">
            Track all your submitted issues and complaints
          </p>
        </div>
        
        {onCreateReport && (
          <button
            onClick={onCreateReport}
            className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            New Report
          </button>
        )}
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
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* View Toggle and Results Count */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredReports.length} of {reports.length} reports
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">View:</span>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg ${viewMode === 'grid' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg ${viewMode === 'list' ? 'bg-blue-50 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Reports Display */}
      {filteredReports.length === 0 ? (
        renderEmptyState()
      ) : viewMode === 'grid' ? (
        renderGridView()
      ) : (
        renderListView()
      )}
    </div>
  )
}

// Default props
CitizenReports.defaultProps = {
  reports: [],
  onViewReport: (reportId) => console.log('View report:', reportId),
  onCreateReport: () => console.log('Create new report')
}

export default CitizenReports