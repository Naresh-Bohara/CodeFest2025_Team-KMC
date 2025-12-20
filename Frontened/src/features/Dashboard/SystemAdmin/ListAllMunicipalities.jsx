import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import {
  Building2,
  Edit,
  Eye,
  Trash2,
  Search,
  Plus,
  MapPin,
  Users,
  Award,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  MoreVertical,
  Mail,
  Phone,
  Calendar,
  Shield,
  Settings
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ROUTES } from '../../../utils/constants/routes';
import { useDeactivateMunicipalityMutation, useGetAllMunicipalitiesQuery } from '../../../store/api/Municipality';

const ListAllMunicipalities = () => {
  const navigate = useNavigate();
  const { data: municipalitiesData, isLoading, error, refetch } = useGetAllMunicipalitiesQuery();
  console.log(municipalitiesData)
  const [deactivateMunicipality, { isLoading: isDeleting }] =useDeactivateMunicipalityMutation();  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMunicipality, setSelectedMunicipality] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [deleteName, setDeleteName] = useState('');
  
  // Extract municipalities from response
  const municipalities = municipalitiesData?.data || [];
  
  // Filter municipalities based on search term
  const filteredMunicipalities = municipalities.filter(municipality => 
    municipality.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    municipality.location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
    municipality.location.province.toLowerCase().includes(searchTerm.toLowerCase()) ||
    municipality.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())
  );



  // Handle view municipality details
  const handleView = (municipality) => {
    setSelectedMunicipality(municipality);
  };

  // Handle delete confirmation
  const handleDeleteClick = (id, name) => {
    setDeleteId(id);
    setDeleteName(name);
    setShowDeleteModal(true);
  };

  // Handle delete municipality
  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deactivateMunicipality(deleteId).unwrap();
      toast.success(
        <div className="flex items-center">
          <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
          <span><strong>{deleteName}</strong> municipality deleted successfully!</span>
        </div>
      );
      refetch();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(
        error.data?.message || 'Failed to delete municipality. Please try again.'
      );
    } finally {
      setShowDeleteModal(false);
      setDeleteId(null);
      setDeleteName('');
    }
  };

  // Handle create new municipality
  const handleCreate = () => {
    navigate(ROUTES.SYSTEM_ADMIN.CREATE_MUNICIPALITY);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
            <p className="text-lg font-medium text-neutral-700">Loading municipalities...</p>
            <p className="text-sm text-neutral-500 mt-2">Please wait while we fetch the data</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col items-center justify-center min-h-[400px]">
            <AlertCircle className="w-12 h-12 text-danger-500 mb-4" />
            <p className="text-lg font-medium text-neutral-700">Failed to load municipalities</p>
            <p className="text-sm text-neutral-500 mt-2 mb-4">Please try again later</p>
            <button
              onClick={() => refetch()}
              className="px-6 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 mb-2 flex items-center">
                <Building2 className="w-8 h-8 text-primary-600 mr-3" />
                Municipalities Management
              </h1>
              <p className="text-neutral-600">
                Manage all registered municipalities and their settings
              </p>
            </div>
            <motion.button
              onClick={handleCreate}
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              
              className="flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-xl 
                       hover:bg-primary-600 transition-all duration-200 shadow-md hover:shadow-lg mt-4 md:mt-0"
            >
              <Plus className="w-5 h-5 mr-2" />
              Add New Municipality
            </motion.button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Total Municipalities</p>
                  <p className="text-3xl font-bold text-neutral-900">{municipalities.length}</p>
                </div>
                <div className="bg-primary-100 p-3 rounded-xl">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
              </div>
              <div className="mt-4 flex items-center text-sm">
                <CheckCircle className="w-4 h-4 text-green-500 mr-1" />
                <span className="text-green-600">All Active</span>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Active Reports</p>
                  <p className="text-3xl font-bold text-neutral-900">1,234</p>
                </div>
                <div className="bg-info-100 p-3 rounded-xl">
                  <Users className="w-6 h-6 text-info-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-neutral-500">
                Across all municipalities
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Citizen Points</p>
                  <p className="text-3xl font-bold text-neutral-900">45,678</p>
                </div>
                <div className="bg-secondary-100 p-3 rounded-xl">
                  <Award className="w-6 h-6 text-secondary-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-neutral-500">
                Total rewards distributed
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500 mb-1">Auto-Assign</p>
                  <p className="text-3xl font-bold text-neutral-900">
                    {municipalities.filter(m => m.settings?.autoAssignReports).length}
                  </p>
                </div>
                <div className="bg-environment-100 p-3 rounded-xl">
                  <Shield className="w-6 h-6 text-environment-600" />
                </div>
              </div>
              <div className="mt-4 text-sm text-neutral-500">
                Municipalities with auto-assign enabled
              </div>
            </div>
          </div>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search municipalities by name, city, province, or email..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-neutral-200 rounded-xl 
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
                             transition-all duration-200"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-neutral-600">
                  Showing {filteredMunicipalities.length} of {municipalities.length} municipalities
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Municipalities Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Municipality
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {filteredMunicipalities.map((municipality) => (
                  <tr 
                    key={municipality._id} 
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="bg-primary-100 p-2 rounded-lg mr-3">
                          <Building2 className="w-5 h-5 text-primary-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-neutral-900">{municipality.name}</p>
                          <div className="flex items-center mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${municipality.settings?.autoAssignReports ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-800'}`}>
                              {municipality.settings?.autoAssignReports ? 'Auto-Assign' : 'Manual'}
                            </span>
                            <span className="ml-2 px-2 py-1 bg-environment-100 text-environment-800 rounded-full text-xs font-medium">
                              {municipality.settings?.pointValue || 5} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 text-neutral-400 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-neutral-900">{municipality.location.city}</p>
                          <p className="text-xs text-neutral-500">{municipality.location.province}</p>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-neutral-500 font-mono">
                        {municipality.location.coordinates?.lat?.toFixed(4)}, {municipality.location.coordinates?.lng?.toFixed(4)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center">
                          <Mail className="w-4 h-4 text-neutral-400 mr-2" />
                          <p className="text-sm text-neutral-700">{municipality.contactEmail}</p>
                        </div>
                        <div className="flex items-center">
                          <Phone className="w-4 h-4 text-neutral-400 mr-2" />
                          <p className="text-sm text-neutral-700">{municipality.contactPhone}</p>
                        </div>
                        {municipality.adminId && (
                          <div className="text-xs text-neutral-500">
                            Admin: {municipality.adminId.name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {municipality.isActive ? (
                          <>
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-green-700">Active</span>
                          </>
                        ) : (
                          <>
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <span className="text-sm font-medium text-red-700">Inactive</span>
                          </>
                        )}
                      </div>
                      <div className="mt-2">
                        {municipality.settings?.citizenRewards ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary-100 text-secondary-800">
                            <Award className="w-3 h-3 mr-1" />
                            Rewards Enabled
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-neutral-100 text-neutral-800">
                            <XCircle className="w-3 h-3 mr-1" />
                            No Rewards
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                        <div>
                          <p className="text-sm text-neutral-700">{formatDate(municipality.createdAt)}</p>
                          <p className="text-xs text-neutral-500">
                            {new Date(municipality.updatedAt).toLocaleDateString() === new Date(municipality.createdAt).toLocaleDateString() ? 
                              'New Today' : 
                              'Updated recently'
                            }
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleView(municipality)}
                          className="p-2 text-info-600 hover:bg-info-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() =>   navigate(`${ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}/edit/${municipality._id}`)}
                          className="p-2 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="Edit Municipality"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(municipality._id, municipality.name)}
                          disabled={isDeleting}
                          className="p-2 text-danger-600 hover:bg-danger-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Delete Municipality"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => navigate(`${ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}/${municipality.id}`)}
                          className="p-2 text-neutral-600 hover:bg-neutral-50 rounded-lg transition-colors"
                          title="More Options"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredMunicipalities.length === 0 && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
              <p className="text-lg font-medium text-neutral-700 mb-2">
                {searchTerm ? 'No municipalities found' : 'No municipalities yet'}
              </p>
              <p className="text-neutral-500 mb-6">
                {searchTerm ? 'Try adjusting your search terms' : 'Create your first municipality to get started'}
              </p>
              {!searchTerm && (
                <button
                  onClick={handleCreate}
                  className="px-6 py-3 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Add First Municipality
                </button>
              )}
            </div>
          )}
        </motion.div>

        {/* Municipality Details Modal */}
        <AnimatePresence>
          {selectedMunicipality && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <Building2 className="w-6 h-6 text-primary-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-neutral-900">
                          {selectedMunicipality.name}
                        </h3>
                        <p className="text-sm text-neutral-500">Municipality Details</p>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedMunicipality(null)}
                      className="text-neutral-400 hover:text-neutral-600"
                    >
                      <XCircle className="w-6 h-6" />
                    </button>
                  </div>

                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                        <MapPin className="w-5 h-5 mr-2" />
                        Location Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">City</p>
                          <p className="font-medium text-neutral-900">{selectedMunicipality.location.city}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">Province</p>
                          <p className="font-medium text-neutral-900">{selectedMunicipality.location.province}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">Latitude</p>
                          <p className="font-mono text-neutral-900">{selectedMunicipality.location.coordinates?.lat?.toFixed(6)}°</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">Longitude</p>
                          <p className="font-mono text-neutral-900">{selectedMunicipality.location.coordinates?.lng?.toFixed(6)}°</p>
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                        <Mail className="w-5 h-5 mr-2" />
                        Contact Information
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">Official Email</p>
                          <p className="font-medium text-neutral-900">{selectedMunicipality.contactEmail}</p>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-1">Contact Phone</p>
                          <p className="font-medium text-neutral-900">{selectedMunicipality.contactPhone}</p>
                        </div>
                        {selectedMunicipality.adminId && (
                          <>
                            <div>
                              <p className="text-sm text-neutral-500 mb-1">Admin Name</p>
                              <p className="font-medium text-neutral-900">{selectedMunicipality.adminId.name}</p>
                            </div>
                            <div>
                              <p className="text-sm text-neutral-500 mb-1">Admin Email</p>
                              <p className="font-medium text-neutral-900">{selectedMunicipality.adminId.email}</p>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Settings */}
                    <div className="bg-neutral-50 rounded-xl p-6">
                      <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                        <Settings className="w-5 h-5 mr-2" />
                        Municipality Settings
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-neutral-900">Auto-Assign Reports</p>
                              <p className="text-sm text-neutral-500">Automatically assign new reports</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMunicipality.settings?.autoAssignReports ? 'bg-primary-100 text-primary-800' : 'bg-neutral-100 text-neutral-800'}`}>
                              {selectedMunicipality.settings?.autoAssignReports ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-neutral-900">Citizen Rewards</p>
                              <p className="text-sm text-neutral-500">Enable points system</p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium ${selectedMunicipality.settings?.citizenRewards ? 'bg-secondary-100 text-secondary-800' : 'bg-neutral-100 text-neutral-800'}`}>
                              {selectedMunicipality.settings?.citizenRewards ? 'Enabled' : 'Disabled'}
                            </div>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-neutral-500 mb-2">Points per Report</p>
                          <div className="flex items-center">
                            <span className="text-2xl font-bold text-primary-600 mr-2">
                              {selectedMunicipality.settings?.pointValue || 5}
                            </span>
                            <span className="text-neutral-600">points</span>
                          </div>
                          <p className="text-sm text-neutral-500 mt-2">
                            Citizens earn this many points for each valid report
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Report Categories */}
                    {selectedMunicipality.reportCategories && selectedMunicipality.reportCategories.length > 0 && (
                      <div className="bg-neutral-50 rounded-xl p-6">
                        <h4 className="font-semibold text-neutral-900 mb-4">Report Categories</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedMunicipality.reportCategories.map((category, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-white border border-neutral-200 rounded-full text-sm text-neutral-700"
                            >
                              {category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-4 mt-8">
                    <button
                      onClick={() => setSelectedMunicipality(null)}
                      className="px-6 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors"
                    >
                      Close
                    </button>
                    <button
                      onClick={() => {
                        handleEdit(selectedMunicipality._id);
                        setSelectedMunicipality(null);
                      }}
                      className="px-6 py-2.5 bg-primary-500 text-white rounded-xl hover:bg-primary-600 transition-colors"
                    >
                      Edit Municipality
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white rounded-2xl max-w-md w-full"
              >
                <div className="p-6">
                  <div className="flex items-center justify-center w-16 h-16 rounded-full bg-danger-100 mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-danger-600" />
                  </div>
                  <h3 className="text-xl font-bold text-neutral-900 text-center mb-2">
                    Delete Municipality
                  </h3>
                  <p className="text-neutral-600 text-center mb-6">
                    Are you sure you want to delete <strong>{deleteName}</strong>? This action cannot be undone and all associated data will be permanently removed.
                  </p>
                  <div className="flex justify-center space-x-4">
                    <button
                      onClick={() => setShowDeleteModal(false)}
                      disabled={isDeleting}
                      className="px-6 py-2.5 text-neutral-700 hover:bg-neutral-100 rounded-xl transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="px-6 py-2.5 bg-danger-500 text-white rounded-xl hover:bg-danger-600 transition-colors disabled:opacity-50"
                    >
                      {isDeleting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                          Deleting...
                        </>
                      ) : (
                        'Delete Municipality'
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ListAllMunicipalities;