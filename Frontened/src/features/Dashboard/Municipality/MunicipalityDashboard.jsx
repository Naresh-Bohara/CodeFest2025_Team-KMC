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
  RefreshCw
} from 'lucide-react';
import { useGetReportsQuery } from '../../../store/api/reportApi';


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
          val.toString().toLowerCase().includes(searchTerm.toLowerCase())
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
                key={row.id}
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
                    ) : column.key === 'reward' ? (
                      <div className="flex items-center gap-2 animate-reward-glow">
                        <Award className="w-4 h-4 text-reward-500" />
                        <span className="font-medium text-reward-600">{row[column.key]} pts</span>
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
    const {data:report}=useGetReportsQuery();
    console.log(report);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Mock data
  const statsData = [
    { title: 'Total Reports', value: '1,247', change: '+12%', icon: FileText, color: 'primary', trend: 'up', subtitle: 'Last 30 days' },
    { title: 'Pending Actions', value: '24', change: '-3%', icon: Clock, color: 'warning', trend: 'down', subtitle: 'Requires attention' },
    { title: 'Resolved Issues', value: '892', change: '+8%', icon: CheckCircle, color: 'environment', trend: 'up', subtitle: '71% resolution rate' },
    { title: 'Active Citizens', value: '5,241', change: '+15%', icon: Users, color: 'info', trend: 'up', subtitle: 'Engaged users' },
    { title: 'Staff Members', value: '42', change: '+2%', icon: UserCheck, color: 'secondary', trend: 'up', subtitle: 'Municipality staff' },
    { title: 'Reward Points', value: '12,480', change: '+25%', icon: Award, color: 'reward', trend: 'up', subtitle: 'Total distributed' },
  ];

  const tableColumns = [
    { key: 'id', label: 'ID' },
    { key: 'title', label: 'Report Title' },
    { key: 'category', label: 'Category' },
    { key: 'status', label: 'Status' },
    { key: 'priority', label: 'Priority' },
    { key: 'date', label: 'Date' },
    { key: 'reward', label: 'Reward' },
  ];

  const tableData = [
    { id: '#RPT-001', title: 'Pothole on Main Street', category: 'Infrastructure', status: 'in_progress', priority: 'high', date: 'Today', reward: 250 },
    { id: '#RPT-002', title: 'Street Light Outage', category: 'Utilities', status: 'pending', priority: 'medium', date: 'Yesterday', reward: 150 },
    { id: '#RPT-003', title: 'Garbage Collection Delay', category: 'Sanitation', status: 'resolved', priority: 'low', date: '2 days ago', reward: 100 },
    { id: '#RPT-004', title: 'Park Maintenance Request', category: 'Parks & Rec', status: 'closed', priority: 'medium', date: '3 days ago', reward: 200 },
    { id: '#RPT-005', title: 'Water Leak Report', category: 'Utilities', status: 'rejected', priority: 'high', date: '4 days ago', reward: 0 },
  ];

  const quickActions = [
    { icon: Plus, title: 'New Report', description: 'Create new issue report', color: 'primary' },
    { icon: Filter, title: 'Filter Reports', description: 'Advanced filtering options', color: 'info' },
    { icon: Download, title: 'Export Data', description: 'Download reports as CSV', color: 'environment' },
    { icon: Settings, title: 'Settings', description: 'Dashboard preferences', color: 'neutral' },
  ];

  const notifications = [
    { type: 'warning', title: 'High Priority Alert', message: 'Emergency repair needed on Bridge Road', time: '10 min ago' },
    { type: 'info', title: 'New Citizen Joined', message: 'John Doe registered as active citizen', time: '1 hour ago' },
    { type: 'success', title: 'Issue Resolved', message: 'Garbage collection route optimized', time: '2 hours ago' },
    { type: 'danger', title: 'Staff Notice', message: 'Staff meeting at 3 PM today', time: '5 hours ago' },
  ];

  const simulateLoading = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (

      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-800 font-heading animate-fade-in">Municipality Dashboard</h1>
            <p className="text-neutral-600 mt-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary-500" />
              Welcome back! Here's what's happening in your municipality.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={simulateLoading}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <div className="relative">
              <button className="p-2 rounded-lg bg-white border border-neutral-300 hover:bg-neutral-50 transition-colors">
                <Bell className="w-5 h-5 text-neutral-600" />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-bounce-subtle">
                  3
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {statsData.map((stat, index) => (
            <StatCard key={index} {...stat} loading={loading} />
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
              loading={loading}
              actions={['view', 'edit', 'delete']}
              onRowClick={(row) => console.log('Row clicked:', row)}
            />

            {/* Chart Section */}
            <ChartContainer
              title="Report Trends"
              subtitle="Monthly report statistics"
              actions={['refresh', 'filter', 'download']}
              loading={loading}
            >
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-reward-glow">
                    <BarChart3 className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-neutral-500">Chart visualization would appear here</p>
                  <p className="text-xs text-neutral-400 mt-1">Using charts from libraries like Recharts or Chart.js</p>
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
                <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full">4 new</span>
              </div>
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <NotificationAlert key={index} {...notification} />
                ))}
              </div>
              <button className="w-full mt-4 text-center text-primary-600 hover:text-primary-700 text-sm font-medium py-2 border border-primary-200 rounded-lg hover:bg-primary-50 transition-colors">
                View All Notifications
              </button>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl shadow-sm border border-neutral-200 p-6 animate-slide-up">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {[
                  { user: 'Sarah Johnson', action: 'submitted new report', time: '2 min ago', color: 'primary' },
                  { user: 'Municipality Staff', action: 'resolved infrastructure issue', time: '15 min ago', color: 'environment' },
                  { user: 'System', action: 'distributed reward points', time: '1 hour ago', color: 'reward' },
                  { user: 'David Wilson', action: 'rated service 5 stars', time: '3 hours ago', color: 'secondary' },
                ].map((activity, index) => (
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
                ))}
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl p-6 text-white animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Performance Score</h3>
                <Star className="w-5 h-5 text-reward-300 animate-reward-glow" />
              </div>
              <div className="text-center mb-4">
                <div className="text-5xl font-bold mb-2">8.7</div>
                <p className="text-primary-100">Out of 10</p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Response Time</span>
                    <span>92%</span>
                  </div>
                  <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Citizen Satisfaction</span>
                    <span>88%</span>
                  </div>
                  <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '88%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Issue Resolution</span>
                    <span>95%</span>
                  </div>
                  <div className="h-2 bg-primary-400 rounded-full overflow-hidden">
                    <div className="h-full bg-white rounded-full" style={{ width: '95%' }}></div>
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
              <h4 className="font-semibold text-neutral-800">Need Help?</h4>
              <p className="text-sm text-neutral-600 mt-1">Contact our support team or check our documentation</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white border border-neutral-300 rounded-lg hover:bg-neutral-50 transition-colors text-sm">
                View Documentation
              </button>
              <button className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors text-sm">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </div>
  );
};

export default MunicipalityDashboard;