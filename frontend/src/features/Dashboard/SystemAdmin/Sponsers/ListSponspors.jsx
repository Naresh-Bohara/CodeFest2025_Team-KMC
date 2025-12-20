import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useGetSponsorsQuery } from '../../../../store/api/sponsors';
import { 
  Eye, 
  Edit2, 
  Trash2, 
  ExternalLink, 
  Calendar,
  Globe,
  Building,
  Mail,
  Phone,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2
} from 'lucide-react';

const SponsorsList = () => {
  const { data: response, isLoading } = useGetSponsorsQuery();
  const sponsors = response?.data || [];
  const pagination = response?.pagination || { page: 1, limit: 10, total: 0, pages: 1 };

  const [filters, setFilters] = useState({
    search: '',
    sponsorType: '',
    scope: '',
    status: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  const getSponsorTypeLabel = (type) => {
    const typeMap = {
      local_business: { label: 'Local Business', color: 'bg-blue-100 text-blue-800' },
      corporate: { label: 'Corporate', color: 'bg-purple-100 text-purple-800' },
      ngo: { label: 'NGO', color: 'bg-green-100 text-green-800' },
      community_event: { label: 'Community Event', color: 'bg-yellow-100 text-yellow-800' },
      music_program: { label: 'Music Program', color: 'bg-pink-100 text-pink-800' },
      party_event: { label: 'Party Event', color: 'bg-indigo-100 text-indigo-800' },
      csr_campaign: { label: 'CSR Campaign', color: 'bg-teal-100 text-teal-800' },
      government_scheme: { label: 'Gov Scheme', color: 'bg-orange-100 text-orange-800' },
      public_awareness: { label: 'Public Awareness', color: 'bg-red-100 text-red-800' },
    };
    return typeMap[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800', icon: '⏳' },
      active: { label: 'Active', color: 'bg-green-100 text-green-800', icon: '✅' },
      inactive: { label: 'Inactive', color: 'bg-red-100 text-red-800', icon: '❌' },
      draft: { label: 'Draft', color: 'bg-gray-100 text-gray-800', icon: '📝' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <span className="mr-1">{config.icon}</span>
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const calculateDaysRemaining = (endDate) => {
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredSponsors = sponsors.filter(sponsor => {
    const matchesSearch = filters.search === '' || 
      sponsor.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      sponsor.title.toLowerCase().includes(filters.search.toLowerCase());
    
    const matchesType = filters.sponsorType === '' || sponsor.sponsorType === filters.sponsorType;
    const matchesScope = filters.scope === '' || sponsor.scope === filters.scope;
    const matchesStatus = filters.status === '' || sponsor.status === filters.status;

    return matchesSearch && matchesType && matchesScope && matchesStatus;
  });

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this sponsor?')) {
      // Add delete mutation here
      console.log('Delete sponsor:', id);
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-heading font-bold text-neutral-900">Sponsors</h1>
            <p className="text-neutral-600 mt-2">Manage advertising campaigns and sponsors</p>
          </div>
          <Link
            to="/dashboard/system-admin/add-sponsors"
            className="bg-primary-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-600 transition-colors duration-300 flex items-center"
          >
            <span className="mr-2">+</span> Add New Sponsor
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mt-8">
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="text-2xl font-bold text-neutral-900">{pagination.total}</div>
            <div className="text-sm text-neutral-600">Total Sponsors</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="text-2xl font-bold text-green-600">
              {sponsors.filter(s => s.status === 'active').length}
            </div>
            <div className="text-sm text-neutral-600">Active</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="text-2xl font-bold text-blue-600">
              {sponsors.filter(s => s.scope === 'global').length}
            </div>
            <div className="text-sm text-neutral-600">Global Scope</div>
          </div>
          <div className="bg-white rounded-xl p-4 border border-neutral-200">
            <div className="text-2xl font-bold text-amber-600">
              {sponsors.filter(s => new Date(s.endDate) > new Date()).length}
            </div>
            <div className="text-sm text-neutral-600">Upcoming</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-card-hover p-6 mb-6 border border-neutral-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
            <input
              type="text"
              placeholder="Search sponsors..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2.5 border border-neutral-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filters.sponsorType}
            onChange={(e) => setFilters({ ...filters, sponsorType: e.target.value })}
            className="border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Types</option>
            <option value="ngo">NGO</option>
            <option value="corporate">Corporate</option>
            <option value="local_business">Local Business</option>
            <option value="community_event">Community Event</option>
            <option value="government_scheme">Government Scheme</option>
          </select>

          {/* Scope Filter */}
          <select
            value={filters.scope}
            onChange={(e) => setFilters({ ...filters, scope: e.target.value })}
            className="border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Scopes</option>
            <option value="global">🌍 Global</option>
            <option value="municipality">🏛 Municipality</option>
          </select>

          {/* Status Filter */}
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="border border-neutral-300 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
            <option value="draft">Draft</option>
          </select>

          {/* Clear Filters */}
          <button
            onClick={() => setFilters({ search: '', sponsorType: '', scope: '', status: '' })}
            className="border border-neutral-300 text-neutral-700 rounded-xl px-4 py-2.5 hover:bg-neutral-50 transition-colors duration-200"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Sponsors Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-primary-500 animate-spin" />
        </div>
      ) : filteredSponsors.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-neutral-200">
          <div className="text-5xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">No sponsors found</h3>
          <p className="text-neutral-600">
            {Object.values(filters).some(f => f) 
              ? 'Try changing your filters' 
              : 'Create your first sponsor to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredSponsors.map((sponsor) => {
            const typeInfo = getSponsorTypeLabel(sponsor.sponsorType);
            const daysRemaining = calculateDaysRemaining(sponsor.endDate);
            const isExpired = daysRemaining < 0;
            
            return (
              <div 
                key={sponsor._id} 
                className="bg-white rounded-2xl shadow-card-hover border border-neutral-100 overflow-hidden hover:shadow-lg transition-shadow duration-300"
              >
                {/* Banner Image */}
                {sponsor.bannerImage && (
                  <div className="h-48 overflow-hidden">
                    <img 
                      src={sponsor.bannerImage} 
                      alt={sponsor.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-6">
                  {/* Header */}
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-heading font-semibold text-neutral-900 mb-1">
                        {sponsor.title}
                      </h3>
                      <div className="flex items-center text-sm text-neutral-600">
                        <span className="mr-4 flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {sponsor.name}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs ${typeInfo.color}`}>
                          {typeInfo.label}
                        </span>
                      </div>
                    </div>
                    {getStatusBadge(sponsor.status)}
                  </div>

                  {/* Description */}
                  <p className="text-neutral-600 mb-4 line-clamp-2">
                    {sponsor.description}
                  </p>

                  {/* Contact Info */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="flex items-center text-sm text-neutral-700">
                      <Mail className="w-4 h-4 mr-2 text-primary-500" />
                      <span className="truncate">{sponsor.contactEmail}</span>
                    </div>
                    <div className="flex items-center text-sm text-neutral-700">
                      <Phone className="w-4 h-4 mr-2 text-primary-500" />
                      <span>{sponsor.contactPhone}</span>
                    </div>
                  </div>

                  {/* Date & Scope */}
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center text-sm">
                      <Calendar className="w-4 h-4 mr-2 text-amber-500" />
                      <span className="font-medium">
                        {formatDate(sponsor.startDate)} - {formatDate(sponsor.endDate)}
                      </span>
                    </div>
                    <div className="flex items-center">
                      {sponsor.scope === 'global' ? (
                        <span className="flex items-center text-sm text-blue-600">
                          <Globe className="w-4 h-4 mr-1" />
                          Global
                        </span>
                      ) : (
                        <span className="flex items-center text-sm text-purple-600">
                          <Building className="w-4 h-4 mr-1" />
                          Municipality
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Days Remaining */}
                  <div className="mb-6">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-neutral-600">Campaign Duration</span>
                      <span className={`font-medium ${isExpired ? 'text-red-600' : daysRemaining <= 7 ? 'text-amber-600' : 'text-green-600'}`}>
                        {isExpired ? 'Expired' : `${daysRemaining} days remaining`}
                      </span>
                    </div>
                    <div className="w-full bg-neutral-100 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isExpired ? 'bg-red-500' : 
                          daysRemaining <= 7 ? 'bg-amber-500' : 
                          'bg-green-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, 100 - (daysRemaining / 30) * 100))}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                    <div className="flex space-x-3">
                      <Link
                        to={`/dashboard/system-admin/sponsors/${sponsor._id}`}
                        className="flex items-center text-primary-600 hover:text-primary-700 transition-colors duration-200"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Link>
                      <Link
                        to={`/dashboard/system-admin/sponsors/edit/${sponsor._id}`}
                        className="flex items-center text-amber-600 hover:text-amber-700 transition-colors duration-200"
                      >
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(sponsor._id)}
                        className="flex items-center text-red-600 hover:text-red-700 transition-colors duration-200"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Delete
                      </button>
                    </div>
                    
                    {sponsor.website && (
                      <a
                        href={sponsor.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Website
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center items-center mt-8 space-x-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          
          {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-lg ${
                  currentPage === pageNum
                    ? 'bg-primary-500 text-white'
                    : 'border border-neutral-300 hover:bg-neutral-50'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
            disabled={currentPage === pagination.pages}
            className="p-2 rounded-lg border border-neutral-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-neutral-50"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};

export default SponsorsList;