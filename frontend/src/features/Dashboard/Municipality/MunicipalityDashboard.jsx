/** @file: MunicipalityDashboard.jsx */
import React, { useState, useEffect } from 'react';
import { 
  AlertCircle, 
  BarChart3, 
  Building2, 
  Calendar, 
  CheckCircle, 
  Clock, 
  Download, 
  Filter, 
  Home, 
  MapPin, 
  MessageSquare, 
  Plus, 
  Search, 
  Settings, 
  TrendingUp, 
  Users, 
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
  ThumbsUp
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
  const validatedReports = reports.filter(r => r.validationInfo?.locationValidated).length;
  const totalPoints = reports.reduce((sum, r) => sum + (r.pointsAwarded || 0), 0);
  
  return {
    totalReports,
    pendingReports,
    resolvedReports,
    highPriorityReports,
    validatedReports,
    totalPoints,
    resolutionRate: totalReports > 0 ? Math.round((resolvedReports / totalReports) * 100) : 0
  };
};

// Reusable Stat Card Component
const StatCard = ({ title, value, change, icon: Icon, color = 'primary', trend = 'up', subtitle, loading = false }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary-50 to-primary-100 border-l-4 border-primary-500',
    secondary: 'bg-gradient-to-br from-secondary-50 to-secondary-100 border-l-4 border-secondary-500',
    info: 'bg-gradient-to-br from-info-50 to-info-100 border-l-4 border-info-500',
    warning: 'bg-gradient-to-br from-warning-50 to-warning-100 border-l-4 border-warning-500',
    danger: 'bg-gradient-to-br from-danger-50 to-danger-100 border-l-4 border-danger-500',
    environment: 'bg-gradient-to-br from-environment-50 to-environment-100 border-l-4 border-environment-500',
    reward: 'bg-gradient-to-br from-reward-50 to-reward-100 border-l-4 border-reward-500',
  };

  const iconColorClasses = {
    primary: 'text-primary-600 bg-primary-100',
    secondary: 'text-secondary-600 bg-secondary-100',
    info: 'text-info-600 bg-info-100',
    warning: 'text-warning-600 bg-warning-100',
    danger: 'text-danger-600 bg-danger-100',
    environment: 'text-environment-600 bg-environment-100',
    reward: 'text-reward-600 bg-reward-100',
  };

  return (
    <div className={`p-6 rounded-xl shadow-sm ${colorClasses[color]} transition-all duration-300 hover:shadow-md animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-600 mb-1">{title}</p>
          {loading ? (
            <div className="h-8 w-24 bg-neutral-200 rounded animate-pulse-gentle"></div>
          ) : (
            <div className="flex items-baseline gap-2 mb-2">
              <h3 className="text-2xl font-bold text-neutral-800">{value}</h3>
              {change && (
                <div className={`flex items-center gap-1 text-sm font-medium ${trend === 'up' ? 'text-environment-600' : 'text-danger-600'}`}>
                  {trend === 'up' ? <TrendingUp className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  <span>{change}</span>
                </div>
              )}
            </div>
          )}
          {subtitle && (
            <p className="text-xs text-neutral-500">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${iconColorClasses[color]} animate-scale-in`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
};

// Reusable Chart Container Component
const ChartContainer = ({ title, subtitle, children, actions = [], loading = false }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 animate-fade-in">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800">{title}</h3>
            {subtitle && (
              <p className="text-sm text-neutral-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            {actions.includes('refresh') && (
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors animate-pulse-gentle">
                <RefreshCw className="w-4 h-4 text-neutral-600" />
              </button>
            )}
            {actions.includes('filter') && (
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <Filter className="w-4 h-4 text-neutral-600" />
              </button>
            )}
            {actions.includes('download') && (
              <button className="p-2 rounded-lg hover:bg-neutral-100 transition-colors">
                <Download className="w-4 h-4 text-neutral-600" />
              </button>
            )}
          </div>
        </div>
      </div>
      <div className="p-6">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center">
              <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-6 h-6 text-neutral-400 animate-pulse-gentle" />
              </div>
              <p className="text-sm text-neutral-500">Loading chart data...</p>
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
      pending: { color: 'warning', icon: Clock },
      in_progress: { color: 'info', icon: Activity },
      resolved: { color: 'environment', icon: CheckCircle },
      closed: { color: 'neutral', icon: Shield },
      rejected: { color: 'danger', icon: XCircle },
    }[status] || { color: 'neutral', icon: AlertCircle };

    const Icon = config.icon;
    const colorClass = `bg-${config.color}-100 text-${config.color}-600`;

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-neutral-200 animate-fade-in">
        <div className="p-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 rounded animate-pulse-gentle mb-2" style={{ animationDelay: `${i * 0.1}s` }}></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-neutral-200 animate-fade-in">
      <div className="p-6 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-neutral-800">Recent Reports</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="Search reports..."
                className="pl-10 pr-4 py-2 border border-neutral-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors animate-scale-in">
              <Plus className="w-4 h-4" />
              New Report
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider"
                >
                  {column.label}
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-neutral-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {paginatedData.map((row, index) => (
              <tr
                key={row._id}
                className={`hover:bg-neutral-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {column.key === 'status' ? (
                      getStatusBadge(row[column.key])
                    ) : column.key === 'priority' ? (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        row[column.key] === 'high' ? 'bg-danger-100 text-danger-700 animate-emergency-pulse' :
                        row[column.key] === 'medium' ? 'bg-warning-100 text-warning-700' :
                        'bg-info-100 text-info-700'
                      }`}>
                        {row[column.key]}
                      </span>
                    ) : column.key === 'pointsAwarded' ? (
                      <div className="flex items-center gap-2 animate-reward-glow">
                        <Award className="w-4 h-4 text-reward-500" />
                        <span className="font-medium text-reward-600">{row[column.key]} pts</span>
                      </div>
                    ) : column.key === 'category' ? (
                      <div className="flex items-center gap-2">
                        {React.createElement(getCategoryIcon(row[column.key]), { className: "w-4 h-4 text-neutral-600" })}
                        <span className="capitalize">{row[column.key]}</span>
                      </div>
                    ) : column.key === 'location' ? (
                      <div className="text-sm text-neutral-700">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>Ward {row.location?.ward}</span>
                        </div>
                        <div className="text-xs text-neutral-500 truncate max-w-[200px]">
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
                          <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center">
                            <UserCheck className="w-3 h-3 text-primary-600" />
                          </div>
                        )}
                        <span className="text-sm">{row.citizenId?.name}</span>
                      </div>
                    ) : column.key === 'validation' ? (
                      <div className="flex items-center gap-2">
                        {row.validationInfo?.locationValidated ? (
                          <div className="flex items-center gap-1 text-environment-600">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-xs">Validated</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-warning-600">
                            <AlertCircle className="w-4 h-4" />
                            <span className="text-xs">Needs Validation</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-sm text-neutral-700">
                        {column.render ? column.render(row) : row[column.key]}
                      </div>
                    )}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2">
                      {actions.includes('view') && (
                        <button className="p-1.5 hover:bg-info-100 rounded-lg transition-colors text-info-600" title="View">
                          <Eye className="w-4 h-4" />
                        </button>
                      )}
                      {actions.includes('edit') && (
                        <button className="p-1.5 hover:bg-warning-100 rounded-lg transition-colors text-warning-600" title="Edit">
                          <Edit className="w-4 h-4" />
                        </button>
                      )}
                      {actions.includes('delete') && (
                        <button className="p-1.5 hover:bg-danger-100 rounded-lg transition-colors text-danger-600 animate-shake-gentle" title="Delete">
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
        <div className="px-6 py-4 border-t border-neutral-100">
          <div className="flex items-center justify-between">
            <p className="text-sm text-neutral-500">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded-lg transition-colors ${
                    currentPage === i + 1
                      ? 'bg-primary-500 text-white'
                      : 'hover:bg-neutral-100 text-neutral-600'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg hover:bg-neutral-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
const QuickActionCard = ({ icon: Icon, title, description, color = 'primary', onClick }) => {
  const colorClasses = {
    primary: 'bg-gradient-to-br from-primary-500 to-primary-600',
    secondary: 'bg-gradient-to-br from-secondary-500 to-secondary-600',
    info: 'bg-gradient-to-br from-info-500 to-info-600',
    warning: 'bg-gradient-to-br from-warning-500 to-warning-600',
    danger: 'bg-gradient-to-br from-danger-500 to-danger-600',
    environment: 'bg-gradient-to-br from-environment-500 to-environment-600',
    reward: 'bg-gradient-to-br from-reward-500 to-reward-600',
  };

  return (
    <button
      onClick={onClick}
      className={`${colorClasses[color]} text-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-scale-in`}
    >
      <div className="flex flex-col items-center text-center gap-3">
        <div className="p-3 bg-white/20 rounded-lg">
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-semibold">{title}</h4>
          <p className="text-sm opacity-90 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );
};

// Notification Alert Component
const NotificationAlert = ({ type = 'info', title, message, time, onClick }) => {
  const typeConfig = {
    info: { icon: Bell, bg: 'bg-info-100', border: 'border-info-200', text: 'text-info-700' },
    warning: { icon: AlertCircle, bg: 'bg-warning-100', border: 'border-warning-200', text: 'text-warning-700' },
    danger: { icon: AlertCircle, bg: 'bg-danger-100', border: 'border-danger-200', text: 'text-danger-700' },
    success: { icon: CheckCircle, bg: 'bg-environment-100', border: 'border-environment-200', text: 'text-environment-700' },
  };

  const { icon: Icon, bg, border, text } = typeConfig[type];

  return (
    <div
      onClick={onClick}
      className={`${bg} border ${border} rounded-lg p-4 mb-2 cursor-pointer hover:shadow-sm transition-all duration-200 animate-slide-up`}
    >
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-lg ${text}`}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-neutral-800">{title}</h4>
          <p className="text-sm text-neutral-600 mt-1">{message}</p>
          {time && (
            <p className="text-xs text-neutral-500 mt-2">{time}</p>
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
  const [activeTab, setActiveTab] = useState('overview');

  // Process real data
  const reports = reportData?.data || [];
  const stats = calculateStats(reports);
  
  // Format table data from real reports
  const tableColumns = [
    { key: 'title', label: 'Report Title' },
    { key: 'category', label: 'Category' },
    { key: 'location', label: 'Location' },
    { key: 'citizen', label: 'Citizen' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'pointsAwarded', label: 'Reward' },
    { key: 'validation', label: 'Validation' },
  ];

  const tableData = reports.map(report => ({
    ...report,
    id: report._id,
    date: formatDate(report.createdAt)
  }));

  // Calculate stats for dashboard
  const statsData = stats ? [
    { title: 'Total Reports', value: stats.totalReports.toString(), change: '+12%', icon: FileText, color: 'primary', trend: 'up', subtitle: `${reportData?.pagination?.total || 0} total` },
    { title: 'Pending Actions', value: stats.pendingReports.toString(), change: '-3%', icon: Clock, color: 'warning', trend: 'down', subtitle: 'Requires attention' },
    { title: 'Resolved Issues', value: stats.resolvedReports.toString(), change: '+8%', icon: CheckCircle, color: 'environment', trend: 'up', subtitle: `${stats.resolutionRate}% resolution rate` },
    { title: 'High Priority', value: stats.highPriorityReports.toString(), change: '+5%', icon: AlertTriangle, color: 'danger', trend: 'up', subtitle: 'Emergency issues' },
    { title: 'Validated Reports', value: stats.validatedReports.toString(), change: '+18%', icon: CheckCircle, color: 'info', trend: 'up', subtitle: 'Location verified' },
    { title: 'Reward Points', value: stats.totalPoints.toString(), change: '+25%', icon: Award, color: 'reward', trend: 'up', subtitle: 'Total distributed' },
  ] : [];

  const quickActions = [
    { icon: Plus, title: 'New Report', description: 'Create new issue report', color: 'primary' },
    { icon: Filter, title: 'Filter Reports', description: 'Advanced filtering options', color: 'info' },
    { icon: Download, title: 'Export Data', description: 'Download reports as CSV', color: 'environment' },
    { icon: Settings, title: 'Settings', description: 'Dashboard preferences', color: 'neutral' },
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
    action: `submitted ${report.category} report`,
    time: formatDate(report.createdAt),
    color: report.priority === 'high' ? 'danger' : report.validationInfo?.locationValidated ? 'environment' : 'info'
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

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-neutral-800 font-heading animate-fade-in">
            {reports[0]?.municipalityId?.name || 'Municipality'} Dashboard
          </h1>
          <p className="text-neutral-600 mt-2 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-primary-500" />
            {reports[0]?.municipalityId?.location?.city ? 
              `Welcome to ${reports[0].municipalityId.location.city} Municipality Dashboard` :
              'Welcome back! Here\'s what\'s happening in your municipality.'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={simulateLoading}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading || loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <div className="relative">
            <button className="p-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors">
              <Bell className="w-5 h-5 text-neutral-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-subtle">
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

          {/* Chart Section */}
          <ChartContainer
            title="Report Trends"
            subtitle={`Showing ${reports.length} reports from ${reportData?.pagination?.total || 0} total`}
            actions={['refresh', 'filter', 'download']}
            loading={isLoading || loading}
          >
            <div className="h-64 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-reward-glow">
                  <BarChart3 className="w-8 h-8 text-white" />
                </div>
                <p className="text-sm text-neutral-500">Report Analytics Dashboard</p>
                <div className="mt-4 grid grid-cols-2 gap-4 max-w-md mx-auto">
                  <div className="text-left p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Categories</p>
                    <p className="font-semibold">{new Set(reports.map(r => r.category)).size} Types</p>
                  </div>
                  <div className="text-left p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Avg. Response</p>
                    <p className="font-semibold">24-48 hrs</p>
                  </div>
                  <div className="text-left p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Active Wards</p>
                    <p className="font-semibold">{new Set(reports.map(r => r.location?.ward).filter(Boolean)).size} Wards</p>
                  </div>
                  <div className="text-left p-3 bg-neutral-50 rounded-lg">
                    <p className="text-xs text-neutral-500">Citizens</p>
                    <p className="font-semibold">{new Set(reports.map(r => r.citizenId?._id).filter(Boolean)).size} Active</p>
                  </div>
                </div>
              </div>
            </div>
          </ChartContainer>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-neutral-800">Notifications</h3>
              {notifications.length > 0 && (
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">
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
                  <Bell className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                  <p className="text-sm text-neutral-500">No new notifications</p>
                </div>
              )}
            </div>
            <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 text-sm font-medium py-2 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
              View All Notifications
            </button>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-slide-up">
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 hover:bg-neutral-50 rounded-lg transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-${activity.color}-100 flex items-center justify-center`}>
                      <UserCheck className={`w-4 h-4 text-${activity.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-neutral-800">
                        <span className="font-medium">{activity.user}</span> {activity.action}
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6">
                  <Activity className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                  <p className="text-sm text-neutral-500">No recent activity</p>
                </div>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Performance Score</h3>
              <Star className="w-5 h-5 text-reward-300 animate-reward-glow" />
            </div>
            <div className="text-center mb-4">
              <div className="text-5xl font-bold mb-2">{calculatePerformanceScore()}</div>
              <p className="text-primary-100">Out of 10</p>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Validation Rate</span>
                  <span>{stats ? `${Math.round((stats.validatedReports / stats.totalReports) * 100)}%` : '92%'}</span>
                </div>
                <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats ? Math.round((stats.validatedReports / stats.totalReports) * 100) : 92}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Resolution Rate</span>
                  <span>{stats ? `${stats.resolutionRate}%` : '88%'}</span>
                </div>
                <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats ? stats.resolutionRate : 88}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Citizen Engagement</span>
                  <span>{stats && stats.totalReports > 0 ? `${Math.round((stats.totalPoints / stats.totalReports) * 10)}%` : '95%'}</span>
                </div>
                <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-white rounded-full" 
                    style={{ width: `${stats && stats.totalReports > 0 ? Math.round((stats.totalPoints / stats.totalReports) * 10) : 95}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="bg-gradient-to-r from-neutral-50 to-neutral-100 border border-neutral-200 rounded-xl p-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-neutral-800">Dashboard Summary</h4>
            <p className="text-sm text-neutral-600 mt-1">
              Showing data from {reports.length} reports • {stats?.pendingReports || 0} pending actions • 
              Last updated: {reports.length > 0 ? formatDate(reports[0].updatedAt) : 'Never'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
              Generate Report
            </button>
            <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
              Export Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MunicipalityDashboard;