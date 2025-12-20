/** @file: MunicipalityDashboard.jsx */
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  BarChart3, 
  Building2, 
  CheckCircle, 
  Clock, 
  Download, 
  Filter, 
  MapPin, 
  Search, 
  Settings, 
  TrendingUp, 
  XCircle,
  Eye,
  Edit,
  Trash2,
  ChevronRight,
  Star,
  Award,
  FileText,
  Bell,
  UserCheck,
  Shield,
  Activity,
  RefreshCw,
  Wrench,
  AlertTriangle,
  Users,
  Home
} from 'lucide-react';
import { useGetReportsQuery } from '../../../store/api/reportApi';

// Helper function to format date
const formatDate = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

// Helper function to get category icon
const getCategoryIcon = (category) => {
  const icons = {
    electricity: AlertCircle,
    road: Wrench,
    water: AlertTriangle,
    sanitation: Shield,
    infrastructure: Building2,
    housing: Home,
    default: FileText
  };
  return icons[category] || icons.default;
};

// Helper function to calculate stats from real data
const calculateStats = (reports) => {
  if (!reports || !Array.isArray(reports)) return null;
  
  const totalReports = reports.length;
  const pendingReports = reports.filter(r => r.status === 'pending').length;
  const resolvedReports = reports.filter(r => r.status === 'resolved').length;
  const highPriorityReports = reports.filter(r => r.priority === 'high').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress').length;
  const validatedReports = reports.filter(r => r.validationInfo?.locationValidated).length;
  const totalPoints = reports.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
  
  return {
    totalReports,
    pendingReports,
    resolvedReports,
    highPriorityReports,
    inProgressReports,
    validatedReports,
    totalPoints,
    resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
  };
};

// Reusable Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, trend = 'up', subtitle, loading = false }) => {
  return (
    <div className={`p-6 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md transition-all duration-300`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-gray-200 rounded animate-pulse"></div>
          ) : (
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
              {change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-teal-600' : 'text-amber-600'}`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg bg-teal-50 text-teal-600`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Reusable Chart Container Component
const ChartContainer = ({ title, subtitle, children, actions = [], loading = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            {subtitle && (
              <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions.includes('refresh') && (
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <RefreshCw className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {actions.includes('filter') && (
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Filter className="w-4 h-4 text-gray-600" />
              </button>
            )}
            {actions.includes('download') && (
              <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <Download className="w-4 h-4 text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">Loading chart data...</p>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Reusable Table Component
const DataTable = ({ columns, data, pageSize = 5, loading = false, onRowClick, actions = [] }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredData, setFilteredData] = useState(data);

  useEffect(() => {
    if (searchTerm) {
      const filtered = data.filter(item =>
        Object.values(item).some(val =>
          val && val.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(data);
    }
  }, [searchTerm, data]);

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = filteredData.slice(startIndex, startIndex + pageSize);

  const getStatusBadge = (status) => {
    const config = {
      pending: { color: 'amber', icon: Clock },
      in_progress: { color: 'blue', icon: Activity },
      resolved: { color: 'teal', icon: CheckCircle },
      closed: { color: 'gray', icon: Shield },
      rejected: { color: 'red', icon: XCircle },
    }[status] || { color: 'gray', icon: AlertCircle };

    const Icon = config.icon;
    const colorClasses = {
      amber: 'bg-amber-100 text-amber-800',
      blue: 'bg-blue-100 text-blue-800',
      teal: 'bg-teal-100 text-teal-800',
      gray: 'bg-gray-100 text-gray-800',
      red: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colorClasses[config.color]}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-gray-100 via-gray-200 to-gray-100 rounded animate-pulse mb-2" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Municipality Reports</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {paginatedData.map((row, index) => (
              <tr
                key={row._id}
                className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.key === 'status' ? (
                      getStatusBadge(row[column.key])
                    ) : column.key === 'priority' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row[column.key] === 'high' ? 'bg-red-100 text-red-700' :
                        row[column.key] === 'medium' ? 'bg-amber-100 text-amber-700' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {row[column.key]}
                      </span>
                    ) : column.key === 'pointsAwarded' ? (
                      <div className="flex items-center gap-2">
                        <Award className="w-4 h-4 text-amber-500" />
                        <span className="font-medium text-amber-600">{row[column.key]} pts</span>
                      </div>
                    ) : column.key === 'category' ? (
                      <div className="flex items-center gap-2">
                        {React.createElement(getCategoryIcon(row[column.key]), { className: "w-4 h-4 text-gray-600" })}
                        <span className="capitalize">{row[column.key]}</span>
                      </div>
                    ) : column.key === 'location' ? (
                      <div className="text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Ward {row.location?.ward}</span>
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[200px]">
                          {row.location?.address}
                        </div>
                      </div>
                    ) : column.key === 'citizen' ? (
                      <div className="flex items-center gap-2">
                        {row.citizenId?.profileImage ? (
                          <img 
                            src={row.citizenId.profileImage} 
                            alt={row.citizenId.name}
                            className="w-6 h-6 rounded-full"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center">
                            <Users className="w-3 h-3 text-teal-600" />
                          </div>
                        )}
                        <span className="text-sm">{row.citizenId?.name}</span>
                      </div>
                    ) : column.key === 'validation' ? (
                      <div className="flex items-center gap-2">
                        {row.validationInfo?.locationValidated ? (
                          <div className="flex items-center gap-1 text-teal-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Validated</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-amber-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Needs Validation</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-700">
                        {column.render ? column.render(row) : row[column.key]}
                      </div>
                    )}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions.includes('view') && (
                        <button className="p-1.5 hover:bg-blue-50 rounded-lg transition-colors text-blue-600" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {actions.includes('edit') && (
                        <button className="p-1.5 hover:bg-amber-50 rounded-lg transition-colors text-amber-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {actions.includes('delete') && (
                        <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors text-red-600" title="Delete">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-teal-600 text-white'
                      : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Quick Action Card Component
const QuickActionCard = ({ icon: Icon, title, description, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="bg-white border border-gray-200 p-5 rounded-xl shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-3 rounded-lg bg-teal-50 text-teal-600">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Notification Alert Component
const NotificationAlert = ({ type = 'info', title, message, time, onClick }) => {
  const typeConfig = {
    info: { icon: Bell, bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-600' },
    warning: { icon: AlertCircle, bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-600' },
    danger: { icon: AlertCircle, bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-600' },
    success: { icon: CheckCircle, bg: 'bg-teal-50', border: 'border-teal-100', text: 'text-teal-600' },
  };

  const { icon: Icon, bg, border, text } = typeConfig[type];

  return (
    <div
      onClick={onClick}
      className={`${bg} border ${border} rounded-lg p-4 mb-2 cursor-pointer hover:shadow-sm transition-all duration-200`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900">{title}</h4>
          <p className="text-sm text-gray-600 mt-1">{message}</p>
          {time && (
            <p className="text-xs text-gray-500 mt-2">{time}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const MunicipalityDashboard = () => {
  const { data: reportData, isLoading, refetch } = useGetReportsQuery();
  
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Process real data
  const reports = reportData?.data || [];
  const stats = calculateStats(reports);
  
  // Filter reports by status
  const filteredReports = selectedStatus === 'all' 
    ? reports 
    : reports.filter(report => report.status === selectedStatus);
  
  // Format table data from real reports
  const tableColumns = [
    { key: 'title', label: 'Report Title' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'citizen', label: 'Citizen' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'pointsAwarded', label: 'Points' },
    { key: 'validation', label: 'Validation' },
  ];

  const tableData = filteredReports.map(report => ({
    ...report,
    id: report._id,
    date: formatDate(report.createdAt)
  }));

  // Calculate stats for dashboard
  const statsData = stats ? [
    { 
      title: 'Total Reports', 
      value: stats.totalReports.toString(), 
      change: stats.totalReports > 0 ? '+12%' : null, 
      icon: FileText, 
      trend: 'up', 
      subtitle: `${stats.pendingReports} pending, ${stats.resolvedReports} resolved` 
    },
    { 
      title: 'In Progress', 
      value: stats.inProgressReports.toString(), 
      change: stats.inProgressReports > 0 ? '+5%' : null, 
      icon: Activity, 
      trend: 'up', 
      subtitle: 'Currently being addressed' 
    },
    { 
      title: 'Resolved Issues', 
      value: stats.resolvedReports.toString(), 
      change: '+8%', 
      icon: CheckCircle, 
      trend: 'up', 
      subtitle: `${stats.resolutionRate}% resolution rate` 
    },
    { 
      title: 'High Priority', 
      value: stats.highPriorityReports.toString(), 
      change: stats.highPriorityReports > 0 ? '+5%' : null, 
      icon: AlertTriangle, 
      trend: 'up', 
      subtitle: 'Emergency attention needed' 
    },
    { 
      title: 'Validated Reports', 
      value: stats.validatedReports.toString(), 
      change: '+18%', 
      icon: Shield, 
      trend: 'up', 
      subtitle: 'Location verified and confirmed' 
    },
    { 
      title: 'Points Awarded', 
      value: stats.totalPoints.toString(), 
      change: '+25%', 
      icon: Award, 
      trend: 'up', 
      subtitle: 'Total citizen reward points' 
    },
  ] : [];

  const quickActions = [
    { icon: Filter, title: 'Filter Reports', description: 'Advanced filtering options' },
    { icon: Download, title: 'Export Data', description: 'Download reports as CSV' },
    { icon: BarChart3, title: 'Analytics', description: 'View detailed insights' },
    { icon: Settings, title: 'Settings', description: 'Dashboard preferences' },
  ];

  // Generate notifications from real data
  const notifications = reports.slice(0, 4).map(report => ({
    type: report.priority === 'high' ? 'warning' : report.status === 'resolved' ? 'success' : 'info',
    title: report.priority === 'high' ? 'High Priority Alert' : report.status === 'pending' ? 'New Report Submitted' : 'Issue Updated',
    message: `${report.title} - ${report.category}`,
    time: formatDate(report.createdAt),
    data: report
  }));

  // Generate recent activity from real data
  const recentActivity = reports.slice(0, 4).map(report => ({
    user: report.citizenId?.name || 'Anonymous Citizen',
    action: report.status === 'resolved' ? 'resolved issue' : `submitted ${report.category} report`,
    time: formatDate(report.updatedAt || report.createdAt),
    color: report.priority === 'high' ? 'red' : report.validationInfo?.locationValidated ? 'teal' : 'blue'
  }));

  const simulateLoading = () => {
    setLoading(true);
    refetch().finally(() => setLoading(false));
  };

  // Calculate performance score
  const calculatePerformanceScore = () => {
    if (!stats || stats.totalReports === 0) return 8.7;
    
    const validationRate = (stats.validatedReports / stats.totalReports) * 100;
    const pendingRate = (stats.pendingReports / stats.totalReports) * 100;
    
    let score = 8.5; // Base score
    if (validationRate > 50) score += 0.5;
    if (pendingRate < 30) score += 0.5;
    if (stats.resolutionRate > 70) score += 0.5;
    
    return Math.min(10, score).toFixed(1);
  };

  // Status filter options
  const statusOptions = [
    { value: 'all', label: 'All Reports' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'resolved', label: 'Resolved' },
    { value: 'high', label: 'High Priority' },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {reports[0]?.municipalityId?.name || 'Municipality'} Dashboard
          </h1>
          <p className="text-gray-600 mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-teal-600" />
            {reports[0]?.municipalityId?.location?.city ? 
              `${reports[0].municipalityId.location.city} Municipality Administration` :
              'Municipality Administration Dashboard'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select 
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={simulateLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button className="p-2 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
              <Bell className="w-5 h-5 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading || loading} />
        ))}
      </div>

      {/* Charts and Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <QuickActionCard key={index} {...action} />
            ))}
          </div>

          {/* Reports Table */}
          <DataTable
            columns={tableColumns}
            data={tableData}
            loading={isLoading || loading}
            actions={['view', 'edit', 'delete']}
            onRowClick={(row) => console.log('Row clicked:', row)}
          />

          {/* Analytics Section */}
          <ChartContainer
            title="Municipality Analytics"
            subtitle={`Performance overview for ${reports[0]?.municipalityId?.name || 'Municipality'}`}
            actions={['refresh', 'filter', 'download']}
            loading={isLoading || loading}
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center w-full max-w-2xl">
                <div className="w-16 h-16 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-gray-500 mb-6">Municipality Performance Metrics</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{stats?.totalReports || 0}</div>
                    <p className="text-xs text-gray-500 mt-1">Total Reports</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{stats?.resolutionRate || 0}%</div>
                    <p className="text-xs text-gray-500 mt-1">Resolution Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">
                      {stats && stats.totalReports > 0 ? Math.round((stats.validatedReports / stats.totalReports) * 100) : 0}%
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Validation Rate</p>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-2xl font-bold text-teal-600">{calculatePerformanceScore()}</div>
                    <p className="text-xs text-gray-500 mt-1">Performance Score</p>
                  </div>
                </div>
              </div>
            </div>
          </ChartContainer>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-xs bg-teal-100 text-teal-800 px-2 py-1 rounded-full">
                  {notifications.length} new
                </span>
              )}
            </div>
            <div className="space-y-2">
              {notifications.length > 0 ? (
                notifications.map((notification, index) => (
                  <NotificationAlert key={index} {...notification} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No new notifications</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 text-center text-teal-600 hover:text-teal-700 text-sm font-medium py-2 border border-teal-200 rounded-lg hover:bg-teal-50 transition-colors">
              View All Notifications
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full ${
                      activity.color === 'teal' ? 'bg-teal-100' : 
                      activity.color === 'red' ? 'bg-red-100' : 'bg-blue-100'
                    } flex items-center justify-center`}>
                      <UserCheck className={`w-4 h-4 ${
                        activity.color === 'teal' ? 'text-teal-600' : 
                        activity.color === 'red' ? 'text-red-600' : 'text-blue-600'
                      }`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-teal-600 to-teal-700 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Score</h3>
              <Star className="w-5 h-5 text-amber-300" />
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold mb-2">{calculatePerformanceScore()}</div>
              <p className="text-teal-200">Out of 10</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Validation Rate</span>
                  <span>{stats ? `${Math.round((stats.validatedReports / stats.totalReports) * 100)}%` : '0%'}</span>
                </div>
                <div className="h-2 bg-teal-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats ? Math.round((stats.validatedReports / stats.totalReports) * 100) : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resolution Rate</span>
                  <span>{stats ? `${stats.resolutionRate}%` : '0%'}</span>
                </div>
                <div className="h-2 bg-teal-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats ? stats.resolutionRate : 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Response Time</span>
                  <span>{stats && stats.resolvedReports > 0 ? '<24h' : 'N/A'}</span>
                </div>
                <div className="h-2 bg-teal-500 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats && stats.resolvedReports > 0 ? 85 : 0}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-white border border-gray-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-gray-900">Dashboard Summary</h4>
            <p className="text-sm text-gray-600 mt-1">
              Showing {filteredReports.length} of {reports.length} reports • {stats?.pendingReports || 0} pending actions • 
              Last updated: {reports.length > 0 ? formatDate(reports[0].updatedAt) : 'Never'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm">
              Export Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;