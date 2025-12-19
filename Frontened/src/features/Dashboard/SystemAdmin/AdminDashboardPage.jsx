// AdminDashboardPage.jsx
import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  Users, 
  Building, 
  AlertCircle, 
  TrendingUp,
  CheckCircle,
  Clock,
  MapPin,
  Shield,
  ArrowRight,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  MoreVertical
} from "lucide-react";
import { ROUTES } from "../../../utils/constants/routes";
import { useGetAllMunicipalitiesQuery } from "../../../store/api/Municipality";
import Button from "../../../components/atoms/Button/Button";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  const { data, isLoading, isError, refetch } = useGetAllMunicipalitiesQuery();

  const municipalities = data?.data || [];
  const totalMunicipalities = data?.pagination?.total || municipalities.length;

  // Mock data for dashboard stats
  const dashboardStats = {
    totalReports: 12456,
    resolvedReports: 8920,
    pendingReports: 1245,
    averageResolutionTime: '2.5',
    activeCitizens: 4567,
    newUsersToday: 125
  };

  const performanceMetrics = [
    { label: 'Response Rate', value: '92%', change: '+2.3%', positive: true },
    { label: 'Avg. Resolution Time', value: '2.1 days', change: '-0.4 days', positive: true },
    { label: 'Citizen Satisfaction', value: '4.7/5', change: '+0.2', positive: true },
    { label: 'Issues Reported', value: '1,245', change: '+15%', positive: false }
  ];

  const recentActivities = [
    { id: 1, action: 'New municipality registered', entity: 'Kathmandu Metro', time: '10 min ago', icon: <Building className="w-4 h-4" /> },
    { id: 2, action: 'Critical issue resolved', entity: 'Road Repair #245', time: '1 hour ago', icon: <CheckCircle className="w-4 h-4" /> },
    { id: 3, action: 'New admin joined', entity: 'John Doe', time: '2 hours ago', icon: <Users className="w-4 h-4" /> },
    { id: 4, action: 'System update completed', entity: 'Version 2.1', time: '5 hours ago', icon: <Shield className="w-4 h-4" /> }
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again</p>
        <Button variant="primary" onClick={refetch}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
      >
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Monitor system performance and manage municipalities</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.SYSTEM_ADMIN.MUNICIPALITIES)}
            className="flex items-center gap-2"
          >
            <Building className="w-4 h-4" />
            Manage Municipalities
          </Button>
        </div>
      </motion.div>

      {/* Time Range Filter */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
          {['day', 'week', 'month', 'quarter', 'year'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                timeRange === range
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {range.charAt(0).toUpperCase() + range.slice(1)}
            </button>
          ))}
        </div>
        
        <Button variant="ghost" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Municipalities',
            value: totalMunicipalities,
            change: '+3 this month',
            icon: <Building className="w-6 h-6" />,
            color: 'bg-blue-500',
            link: ROUTES.SYSTEM_ADMIN.MUNICIPALITIES
          },
          {
            title: 'Active Citizens',
            value: dashboardStats.activeCitizens.toLocaleString(),
            change: `+${dashboardStats.newUsersToday} today`,
            icon: <Users className="w-6 h-6" />,
            color: 'bg-green-500',
            link: '#'
          },
          {
            title: 'Issues Reported',
            value: dashboardStats.totalReports.toLocaleString(),
            change: `${dashboardStats.resolvedReports.toLocaleString()} resolved`,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'bg-orange-500',
            link: '#'
          },
          {
            title: 'Avg. Resolution Time',
            value: `${dashboardStats.averageResolutionTime} days`,
            change: '-0.3 days from last month',
            icon: <Clock className="w-6 h-6" />,
            color: 'bg-purple-500',
            link: '#'
          }
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => stat.link && navigate(stat.link)}
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.color} text-white`}>
                {stat.icon}
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</h3>
            <p className="text-gray-900 font-medium mb-1">{stat.title}</p>
            <p className="text-sm text-gray-500">{stat.change}</p>
          </motion.div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Cards */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                <p className="text-sm text-gray-500">Key indicators for {timeRange}</p>
              </div>
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {performanceMetrics.map((metric, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">{metric.label}</span>
                    <span className={`text-sm font-medium ${metric.positive ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metric.positive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ width: `${Math.min(100, Math.abs(parseFloat(metric.change)) * 10)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activities</h3>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                  <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                    {activity.icon}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{activity.action}</p>
                    <p className="text-sm text-gray-500">{activity.entity}</p>
                  </div>
                  <span className="text-sm text-gray-400">{activity.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Municipality List */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Municipalities</h3>
                <p className="text-sm text-gray-500">{totalMunicipalities} total municipalities</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate(ROUTES.SYSTEM_ADMIN.MUNICIPALITIES)}
                className="flex items-center gap-2"
              >
                <Building className="w-4 h-4" />
                Add New
              </Button>
            </div>
            
            <div className="space-y-3">
              {municipalities.slice(0, 5).map((municipality) => (
                <motion.div
                  key={municipality._id}
                  whileHover={{ scale: 1.01 }}
                  className="group p-4 border rounded-lg hover:border-primary-300 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900 group-hover:text-primary-600">
                          {municipality.name}
                        </h4>
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          municipality.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {municipality.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{municipality.location?.city}, {municipality.location?.province}</span>
                      </div>
                      <p className="text-xs text-gray-400">
                        Admin: {municipality.adminId?.name || 'Not assigned'}
                      </p>
                    </div>
                    
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-100 rounded">
                      <MoreVertical className="w-5 h-5 text-gray-400" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-3 pt-3 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}/${municipality._id}`)}
                      className="text-xs"
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      View
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate(`${ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}/${municipality._id}/edit`)}
                      className="text-xs"
                    >
                      <Edit className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {municipalities.length > 5 && (
              <div className="mt-4 pt-4 border-t">
                <Button
                  variant="ghost"
                  className="w-full text-primary-600"
                  onClick={() => navigate(ROUTES.SYSTEM_ADMIN.MUNICIPALITIES)}
                >
                  View All Municipalities
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white">
            <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => navigate(ROUTES.SYSTEM_ADMIN.MUNICIPALITIES_CREATE)}
                className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Building className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Add Municipality</p>
                    <p className="text-sm text-primary-100">Register new municipality</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate(ROUTES.SYSTEM_ADMIN.ADMINS)}
                className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-5 h-5" />
                  <div>
                    <p className="font-medium">Manage Admins</p>
                    <p className="text-sm text-primary-100">Add/remove system admins</p>
                  </div>
                </div>
              </button>
              
              <button
                onClick={() => navigate(ROUTES.SYSTEM_ADMIN.SETTINGS)}
                className="w-full text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5" />
                  <div>
                    <p className="font-medium">System Settings</p>
                    <p className="text-sm text-primary-100">Configure platform settings</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;