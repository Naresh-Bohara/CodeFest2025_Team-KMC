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
  MoreVertical,
  User,
  Calendar,
  AlertTriangle,
  CheckSquare
} from "lucide-react";
import { ROUTES } from "../../../utils/constants/routes";
import { useGetAllMunicipalitiesQuery } from "../../../store/api/Municipality";
import Button from "../../../components/atoms/Button/Button";
import { useGetReportsQuery } from "../../../store/api/reportApi";

const AdminDashboardPage = () => {
  const navigate = useNavigate();
  const [timeRange, setTimeRange] = useState('month');
  
  // Fetch data
  const { data: municipalitiesData, isLoading: loadingMunicipalities, isError: municipalitiesError, refetch: refetchMunicipalities } = useGetAllMunicipalitiesQuery();
  const { data: reportsData, isLoading: loadingReports, isError: reportsError, refetch: refetchReports } = useGetReportsQuery();
  
  // Extract data from responses
  const municipalities = municipalitiesData?.data || [];
  const totalMunicipalities = municipalitiesData?.pagination?.total || municipalities.length;
  
  const reports = reportsData?.data || [];
  const totalReports = reportsData?.pagination?.total || reports.length;
  
  // Calculate stats from real reports data
  const resolvedReports = reports.filter(report => report.status === 'resolved').length;
  const pendingReports = reports.filter(report => report.status === 'pending').length;
  const verifiedReports = reports.filter(report => 
    report.validationInfo?.locationValidated === true
  ).length;
  
  // Calculate categories from reports
  const reportCategories = reports.reduce((acc, report) => {
    const category = report.category || 'other';
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate priorities from reports
  const priorityCounts = reports.reduce((acc, report) => {
    const priority = report.priority || 'medium';
    acc[priority] = (acc[priority] || 0) + 1;
    return acc;
  }, {});
  
  // Calculate dashboard stats from real data
  const dashboardStats = {
    totalReports: totalReports,
    resolvedReports: resolvedReports,
    pendingReports: pendingReports,
    verifiedReports: verifiedReports,
    activeMunicipalities: municipalities.filter(m => m.isActive !== false).length,
    totalCitizens: 4567, // You might need to fetch this from another API
    newUsersToday: 125
  };

  const performanceMetrics = [
    { 
      label: 'Response Rate', 
      value: `${resolvedReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0}%`, 
      change: '+2.3%', 
      positive: true 
    },
    { 
      label: 'Avg. Severity', 
      value: reports.length > 0 
        ? reports.reduce((sum, r) => sum + (r.severity === 'high' ? 3 : r.severity === 'medium' ? 2 : 1), 0) / reports.length 
        : 0, 
      change: '+0.2', 
      positive: false 
    },
    { 
      label: 'Verification Rate', 
      value: `${verifiedReports > 0 ? Math.round((verifiedReports / totalReports) * 100) : 0}%`, 
      change: '+5%', 
      positive: true 
    },
    { 
      label: 'Active Issues', 
      value: pendingReports, 
      change: '+15%', 
      positive: false 
    }
  ];

  // Get recent activities from actual reports
  const recentActivities = reports.slice(0, 4).map(report => ({
    id: report._id,
    action: report.title,
    entity: report.citizenId?.name || 'Anonymous',
    time: formatTimeAgo(report.createdAt),
    icon: <AlertCircle className="w-4 h-4" />,
    status: report.status,
    category: report.category
  }));

  // Helper function to format time ago
  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Helper function to get category icon
  const getCategoryIcon = (category) => {
    switch(category) {
      case 'road': return '🛣️';
      case 'water': return '💧';
      case 'electricity': return '⚡';
      case 'garbage': return '🗑️';
      case 'sanitation': return '🚽';
      default: return '📋';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loadingMunicipalities || loadingReports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (municipalitiesError || reportsError) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Failed to load data</h3>
        <p className="text-gray-600 mb-4">Please check your connection and try again</p>
        <Button variant="primary" onClick={() => { refetchMunicipalities(); refetchReports(); }}>
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
            onClick={() => { refetchMunicipalities(); refetchReports(); }}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Data
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

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Total Municipalities',
            value: totalMunicipalities,
            change: `${dashboardStats.activeMunicipalities} active`,
            icon: <Building className="w-6 h-6" />,
            color: 'bg-blue-500',
            link: ROUTES.SYSTEM_ADMIN.MUNICIPALITIES
          },
          {
            title: 'Total Reports',
            value: dashboardStats.totalReports,
            change: `${dashboardStats.resolvedReports} resolved`,
            icon: <AlertCircle className="w-6 h-6" />,
            color: 'bg-orange-500',
            link: '#'
          },
          {
            title: 'Pending Reports',
            value: dashboardStats.pendingReports,
            change: `${dashboardStats.verifiedReports} verified`,
            icon: <Clock className="w-6 h-6" />,
            color: 'bg-yellow-500',
            link: '#'
          },
          {
            title: 'Active Citizens',
            value: dashboardStats.totalCitizens.toLocaleString(),
            change: `+${dashboardStats.newUsersToday} today`,
            icon: <Users className="w-6 h-6" />,
            color: 'bg-green-500',
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

      {/* Performance Metrics & Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Metrics & Recent Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Performance Metrics */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
                <p className="text-sm text-gray-500">Based on real-time report data</p>
              </div>
              <select 
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="border rounded-lg px-3 py-2 text-sm"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
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
                  <div className="text-2xl font-bold text-gray-900">
                    {typeof metric.value === 'number' && metric.value < 10 
                      ? metric.value.toFixed(1) 
                      : metric.value}
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${metric.positive ? 'bg-green-500' : 'bg-red-500'}`}
                      style={{ 
                        width: `${Math.min(100, 
                          metric.label === 'Avg. Severity' ? (metric.value / 3) * 100 :
                          metric.label === 'Active Issues' ? (metric.value / 100) * 100 :
                          parseFloat(metric.value) || 50
                        )}%` 
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Reports */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Recent Reports</h3>
                <p className="text-sm text-gray-500">{reports.length} total reports in system</p>
              </div>
              <Button variant="ghost" size="sm" className="text-primary-600">
                View All Reports
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
            
            <div className="space-y-4">
              {reports.slice(0, 5).map((report) => (
                <div 
                  key={report._id} 
                  className="flex items-center gap-4 p-4 hover:bg-gray-50 rounded-lg transition-colors border"
                >
                  <div className="text-2xl">
                    {getCategoryIcon(report.category)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-gray-900 truncate">
                        {report.title}
                      </h4>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getPriorityColor(report.priority)}`}>
                        {report.priority}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 truncate mb-1">
                      {report.description}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{report.citizenId?.name || 'Anonymous'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building className="w-3 h-3" />
                        <span>{report.municipalityId?.name || 'Unknown Municipality'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>{formatTimeAgo(report.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/dashboard/system-admin/reports/${report._id}`)}
                    className="text-primary-600 hover:text-primary-700"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                </div>
              ))}
              
              {reports.length === 0 && (
                <div className="text-center py-8">
                  <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No reports found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Municipality List & Quick Actions */}
        <div className="space-y-6">
          {/* Municipality List */}
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
              {municipalities.slice(0, 5).map((municipality) => {
                const municipalityReports = reports.filter(
                  report => report.municipalityId?._id === municipality._id
                );
                const resolvedMunicipalityReports = municipalityReports.filter(
                  report => report.status === 'resolved'
                );
                
                return (
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
                            municipality.isActive !== false
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {municipality.isActive !== false ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                          <MapPin className="w-3 h-3" />
                          <span>
                            {municipality.location?.city || 'City'}, 
                            {municipality.location?.province || 'Province'}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{municipalityReports.length} reports</span>
                          <span>{resolvedMunicipalityReports.length} resolved</span>
                        </div>
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
                );
              })}
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

          {/* Report Categories */}
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Report Categories</h3>
            <div className="space-y-3">
              {Object.entries(reportCategories).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getCategoryIcon(category)}</span>
                    <span className="capitalize">{category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{count}</span>
                    <span className="text-sm text-gray-500">
                      ({Math.round((count / totalReports) * 100)}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
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
                    <p className="font-medium">Manage Reports</p>
                    <p className="text-sm text-primary-100">View and manage reports</p>
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
                    <p className="font-medium">System Analytics</p>
                    <p className="text-sm text-primary-100">View detailed analytics</p>
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