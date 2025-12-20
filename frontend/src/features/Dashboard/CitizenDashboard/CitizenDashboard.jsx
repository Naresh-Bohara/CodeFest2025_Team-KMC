import React, { useState } from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Award,
  MapPin,
  AlertCircle,
  Loader2,
  Star,
  X,
  Target,
  TrendingUp as TrendingUpIcon,
  CheckCircle as CheckCircleIcon
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useGetProfileQuery } from '../../../store/api/authApi'
import { useGetMyReportsQuery } from '../../../store/api/reportApi'

const CitizenDashboard = () => {
  const navigate = useNavigate()
  const [showPointsPopup, setShowPointsPopup] = useState(false)
  
  // Fetch profile data from backend
  const { 
    data: profileData, 
    isLoading: profileLoading,
    isError: profileError,
    error: profileErrorData
  } = useGetProfileQuery()
  
  // Fetch reports data from backend
  const {
    data: reportsData,
    isLoading: reportsLoading,
    isError: reportsError,
    error: reportsErrorData
  } = useGetMyReportsQuery()
  
  // Calculate report statistics from reports data
  const calculateReportStats = React.useMemo(() => {
    if (!reportsData || !reportsData.data) {
      return {
        total: 0,
        pending: 0,
        assigned: 0,
        inProgress: 0,
        resolved: 0
      }
    }
    
    const reports = reportsData.data || []
    
    return {
      total: reports.length,
      pending: reports.filter(report => report.status === 'pending').length,
      assigned: reports.filter(report => report.status === 'assigned').length,
      inProgress: reports.filter(report => report.status === 'in_progress').length,
      resolved: reports.filter(report => report.status === 'resolved').length
    }
  }, [reportsData])
  
  // Get recent reports (latest 5)
  const recentReports = React.useMemo(() => {
    if (!reportsData || !reportsData.data) return []
    
    const reports = reportsData.data || []
    
    // Create a copy before sorting to avoid mutating the original array
    return [...reports]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, 5)
  }, [reportsData])

  const userStats = React.useMemo(() => {
  if (!profileData) {
    return {
      name: 'Citizen User',
      points: 0,
      role: 'citizen',
      municipalityName: 'Local Municipality'
    }
  }

  const user = profileData.data || profileData

  return {
    name: user.name || 'Citizen User',
    points: user.points || 0,
    role: user.role || 'citizen',
    municipalityName: user.municipalityName || 'Local Municipality' 
  }
}, [profileData])

  const dashboardData = {
    user: {
      name: userStats.name,
      points: userStats.points,
      role: userStats.role,
      municipality: userStats.municipalityName
    },
    reports: calculateReportStats,
    recentReports: recentReports
  }

  const statsCards = [
    {
      title: 'Total Reports',
      value: dashboardData.reports.total,
      icon: FileText,
      color: 'blue',
      description: 'All submitted reports'
    },
    {
      title: 'Pending',
      value: dashboardData.reports.pending,
      icon: Clock,
      color: 'yellow',
      description: 'Awaiting review'
    },
    {
      title: 'In Progress',
      value: dashboardData.reports.inProgress,
      icon: TrendingUp,
      color: 'orange',
      description: 'Being addressed'
    },
    {
      title: 'Resolved',
      value: dashboardData.reports.resolved,
      icon: CheckCircle,
      color: 'green',
      description: 'Completed issues'
    }
  ]

  const quickActions = [
    { 
      id: 1, 
      title: 'New Report', 
      icon: AlertTriangle, 
      color: 'red',
      description: 'Report an issue',
      path: '/dashboard/citizen/new'
    },
    { 
      id: 2, 
      title: 'My Reports', 
      icon: FileText, 
      color: 'blue',
      description: 'View all reports',
      path: '/dashboard/citizen/reports'
    },
    { 
      id: 3, 
      title: 'My Points', 
      icon: Award, 
      color: 'purple',
      description: 'View points & rewards',
      onClick: () => setShowPointsPopup(true)
    }
  ]

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800'
    
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_progress':
      case 'in progress': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatStatus = (status) => {
    if (!status) return 'Unknown'
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      })
    } catch (error) {
      return 'Invalid Date'
    }
  }

  const formatCategory = (category) => {
    if (!category) return 'General'
    return category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  // Combined loading state
  const isLoading = profileLoading || reportsLoading

  // Combined error state
  const isError = profileError || reportsError
  const errorMessage = profileErrorData?.data?.message || 
                      reportsErrorData?.data?.message || 
                      'Failed to load dashboard data. Please try again.'

  // Loading state
  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (isError) {
    return (
      <div className="p-4 md:p-6">
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
          </div>
          <p className="text-red-600 text-sm mt-2">
            {errorMessage}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-3 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  // Simple Points Popup Modal
  const PointsPopup = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Award className="w-6 h-6 text-amber-600 mr-2" />
            <h2 className="text-xl font-bold text-gray-900">My Points</h2>
          </div>
          <button 
            onClick={() => setShowPointsPopup(false)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Points Content */}
        <div className="p-6">
          {/* Total Points */}
          <div className="text-center mb-6">
            <div className="text-4xl font-bold text-amber-600 mb-2">
              {dashboardData.user.points}
            </div>
            <p className="text-gray-600">Total Points Earned</p>
          </div>

          {/* Points Breakdown */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reports Submitted</p>
                  <p className="text-sm text-gray-600">{dashboardData.reports.total} reports</p>
                </div>
              </div>
              <span className="text-lg font-bold text-blue-700">+{dashboardData.reports.total * 10}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
              <div className="flex items-center">
                <CheckCircleIcon className="w-5 h-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">Reports Resolved</p>
                  <p className="text-sm text-gray-600">{dashboardData.reports.resolved} resolved</p>
                </div>
              </div>
              <span className="text-lg font-bold text-green-700">+{dashboardData.reports.resolved * 30}</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center">
                <TrendingUpIcon className="w-5 h-5 text-orange-600 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">In Progress</p>
                  <p className="text-sm text-gray-600">{dashboardData.reports.inProgress} ongoing</p>
                </div>
              </div>
              <span className="text-lg font-bold text-orange-700">+{dashboardData.reports.inProgress * 5}</span>
            </div>
          </div>

          {/* Quick Points Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">How Points Work</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Submit report: +10 points</li>
              <li>• Report verified: +20 points</li>
              <li>• Report resolved: +30 points</li>
              <li>• Report in progress: +5 points</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t">
          <button
            onClick={() => {
              setShowPointsPopup(false)
              navigate('/dashboard/citizen/new')
            }}
            className="w-full px-4 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-medium"
          >
            Submit New Report
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="p-4 md:p-6">
      {/* Points Popup Modal */}
      {showPointsPopup && <PointsPopup />}
      
      {/* Welcome Section */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
          Welcome back, {dashboardData.user.name}!
        </h1>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mt-2">
          <p className="text-gray-600">
            Here's what's happening with your reports
          </p>
          <div className="flex items-center mt-2 sm:mt-0">
            <MapPin className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-sm text-gray-600">
              {dashboardData.user.municipality}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          Report Statistics
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsCards.map((stat, index) => {
            const Icon = stat.icon
            const colorClasses = {
              blue: 'bg-blue-50 text-blue-600',
              yellow: 'bg-yellow-50 text-yellow-600',
              orange: 'bg-orange-50 text-orange-600',
              green: 'bg-green-50 text-green-600',
              red: 'bg-red-50 text-red-600',
              purple: 'bg-purple-50 text-purple-600'
            }
            
            return (
              <div 
                key={index} 
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg ${colorClasses[stat.color]}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {stat.value}
                  </span>
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {stat.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {stat.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mb-6 md:mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            const colorClasses = {
              red: 'bg-red-50 text-red-600',
              blue: 'bg-blue-50 text-blue-600',
              green: 'bg-green-50 text-green-600',
              purple: 'bg-purple-50 text-purple-600'
            }
            
            return (
              <button
                key={action.id}
                onClick={action.onClick || (() => navigate(action.path))}
                className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm hover:shadow-md transition-shadow text-left"
              >
                <div className={`p-3 rounded-lg ${colorClasses[action.color]} w-fit mb-3`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-medium text-gray-900 mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {action.description}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Reports */}
      {dashboardData.recentReports.length > 0 && (
        <div className="mt-6 md:mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Recent Reports
            </h2>
            <button 
              onClick={() => navigate('/dashboard/citizen/reports')}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              View All →
            </button>
          </div>
          
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {dashboardData.recentReports.map((report, index) => (
              <div 
                key={report._id || index} 
                className={`p-4 ${index !== dashboardData.recentReports.length - 1 ? 'border-b border-gray-200' : ''} hover:bg-gray-50`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center mb-1">
                      <h3 className="font-medium text-gray-900 truncate mr-2">
                        {report.title || 'Untitled Report'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {formatStatus(report.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {formatCategory(report.category)} • 
                      {report.priority ? ` ${report.priority} priority` : ' Medium priority'}
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center">
                    {(report.pointsAwarded || 0) > 0 && (
                      <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-medium mr-2">
                        <Award className="w-3 h-3 mr-1" />
                        +{report.pointsAwarded}
                      </div>
                    )}
                    <button 
                      onClick={() => navigate(`/reports/${report._id}`)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Reports Message */}
      {dashboardData.reports.total === 0 && !isLoading && (
        <div className="mt-8 text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Reports Yet
          </h3>
          <p className="text-gray-600 mb-4">
            Start by reporting your first community issue
          </p>
          <button 
            onClick={() => navigate('/dashboard/citizen/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AlertTriangle className="w-4 h-4 mr-2" />
            Report an Issue
          </button>
        </div>
      )}
    </div>
  )
}
 
export default CitizenDashboard