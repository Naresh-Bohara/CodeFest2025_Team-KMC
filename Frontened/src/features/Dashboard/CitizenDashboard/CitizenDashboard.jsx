import React from 'react'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  FileText, 
  Users,
  Award,
  MapPin,
  AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'

const SimpleCitizenDashboard = ({ userStats }) => {
  const navigate = useNavigate()
  // Mock data based on your models
  const dashboardData = {
    user: {
      name: userStats?.name || 'Citizen User',
      points: userStats?.points || 0,
      role: userStats?.role || 'citizen',
      municipality: userStats?.municipalityName || 'Local Municipality'
    },
    reports: {
      total: userStats?.totalReports || 0,
      pending: userStats?.pendingReports || 0,
      assigned: userStats?.assignedReports || 0,
      inProgress: userStats?.inProgressReports || 0,
      resolved: userStats?.resolvedReports || 0
    },
    recentReports: userStats?.recentReports || []
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
      path: '/reports'
    },
    { 
      id: 3, 
      title: 'Community', 
      icon: Users, 
      color: 'green',
      description: 'Community activity',
      path: '/community'
    },
    { 
      id: 4, 
      title: 'Rewards', 
      icon: Award, 
      color: 'purple',
      description: 'Points & rewards',
      path: '/rewards'
    }
  ]

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'assigned': return 'bg-blue-100 text-blue-800'
      case 'in_progress': return 'bg-orange-100 text-orange-800'
      case 'resolved': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="p-4 md:p-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="lg:col-span-2">
          <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  onClick={() => window.location.href = action.path}
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

        {/* Points Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-xl p-5 border border-teal-200">
            <div className="flex items-center mb-4">
              <div className="p-2 bg-teal-100 rounded-lg mr-3">
                <Award className="w-6 h-6 text-teal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Your Points</h3>
                <p className="text-sm text-gray-600">Community Contribution</p>
              </div>
            </div>
            
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-teal-700 mb-1">
                {dashboardData.user.points}
              </div>
              <p className="text-sm text-teal-600">Total Points Earned</p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Report Submitted</span>
                <span className="font-medium text-gray-900">+10 points</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Report Verified</span>
                <span className="font-medium text-gray-900">+20 points</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Issue Resolved</span>
                <span className="font-medium text-gray-900">+30 points</span>
              </div>
            </div>
          </div>
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
              onClick={() => window.location.href = '/reports'}
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
                        {report.title}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                        {report.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {report.category} • {report.priority} priority
                    </p>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDate(report.createdAt)}
                    </div>
                  </div>
                  
                  <div className="mt-2 sm:mt-0 sm:ml-4 flex items-center">
                    {report.pointsAwarded > 0 && (
                      <div className="flex items-center bg-amber-50 text-amber-700 px-2 py-1 rounded text-sm font-medium mr-2">
                        <Award className="w-3 h-3 mr-1" />
                        +{report.pointsAwarded}
                      </div>
                    )}
                    <button 
                      onClick={() => window.location.href = `/reports/${report._id}`}
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
      {dashboardData.reports.total === 0 && (
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
            onClick={() =>navigate('/dashboard/citizen/new')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <AlertTriangle  className="w-4 h-4 mr-2" />
            Report an Issue
          </button>
        </div>
      )}
    </div>
  )
}

// Default props
SimpleCitizenDashboard.defaultProps = {
  userStats: {
    name: 'Citizen User',
    points: 0,
    role: 'citizen',
    totalReports: 0,
    pendingReports: 0,
    assignedReports: 0,
    inProgressReports: 0,
    resolvedReports: 0,
    recentReports: []
  }
}

export default SimpleCitizenDashboard