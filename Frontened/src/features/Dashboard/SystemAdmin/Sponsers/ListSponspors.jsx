import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

/* ---------------- HELPERS ---------------- */

const calculateDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.abs(end - start);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/* ---------------- COMPONENT ---------------- */

const SponsorsList = () => {
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    sponsorType: '',
    scope: '',
    status: '',
    page: 1,
    limit: 10,
  });

  const [pagination, setPagination] = useState({
    total: 0,
    pages: 1,
    currentPage: 1,
  });

  useEffect(() => {
    fetchSponsors();
  }, [filters]);

  const fetchSponsors = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams(filters).toString();
      const response = await axios.get(`/api/sponsors?${queryParams}`);

      setSponsors(response.data.data || []);
      setPagination(response.data.pagination || {});
    } catch (error) {
      console.error('Error fetching sponsors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const getSponsorTypeLabel = (type) => {
    const typeMap = {
      local_business: 'Local Business',
      corporate: 'Corporate',
      ngo: 'NGO',
      community_event: 'Community Event',
      music_program: 'Music Program',
      party_event: 'Party Event',
      csr_campaign: 'CSR Campaign',
      government_scheme: 'Government Scheme',
      public_awareness: 'Public Awareness',
    };
    return typeMap[type] || type;
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Pending' },
      active: { color: 'bg-green-100 text-green-800', label: 'Active' },
      inactive: { color: 'bg-red-100 text-red-800', label: 'Inactive' },
    };

    const config = statusConfig[status] || statusConfig.pending;

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDate = (date) => new Date(date).toLocaleDateString();

  const hasActiveFilters =
    filters.sponsorType || filters.scope || filters.status;

  /* ---------------- UI ---------------- */

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Sponsors</h1>
          <p className="text-gray-600">Manage advertising campaigns</p>
        </div>
        <Link
          to="/dashboard/system-admin/add-sponsors"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add New Sponsor
        </Link>
      </div>

      {/* Sponsors Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin h-12 w-12 border-b-2 border-blue-600 rounded-full" />
          </div>
        ) : sponsors.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium">No sponsors found</h3>
            <p className="text-sm text-gray-500">
              {hasActiveFilters
                ? 'Try changing your filters'
                : 'Create your first sponsor'}
            </p>
          </div>
        ) : (
          <>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium">Campaign</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Sponsor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Scope</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Dates</th>
                  <th className="px-6 py-3 text-left text-xs font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {sponsors.map((sponsor) => (
                  <tr key={sponsor._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <Link
                        to={`/sponsors/${sponsor._id}`}
                        className="text-blue-600 font-medium"
                      >
                        {sponsor.title}
                      </Link>
                      <p className="text-sm text-gray-500 truncate max-w-xs">
                        {sponsor.description?.slice(0, 60)}...
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <div>{sponsor.name}</div>
                      <div className="text-sm text-gray-500">
                        {sponsor.contactEmail}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {getSponsorTypeLabel(sponsor.sponsorType)}
                    </td>

                    <td className="px-6 py-4">
                      {sponsor.scope === 'global' ? '🌍 Global' : '🏛 Municipality'}
                    </td>

                    <td className="px-6 py-4">
                      {getStatusBadge(sponsor.status)}
                    </td>

                    <td className="px-6 py-4">
                      {formatDate(sponsor.startDate)} – {formatDate(sponsor.endDate)}
                      <div className="text-xs text-gray-500">
                        {calculateDuration(
                          sponsor.startDate,
                          sponsor.endDate
                        )}{' '}
                        days
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex space-x-3">
                        <Link
                          to={`/sponsors/${sponsor._id}`}
                          className="text-blue-600"
                        >
                          View
                        </Link>
                        <Link
                          to={`/sponsors/edit/${sponsor._id}`}
                          className="text-green-600"
                        >
                          Edit
                        </Link>
                        <button className="text-red-600">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default SponsorsList;
