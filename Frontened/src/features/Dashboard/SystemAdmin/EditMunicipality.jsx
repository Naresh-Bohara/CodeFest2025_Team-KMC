import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  Building2,
  UserCog,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Sparkles,
  Map,
  Maximize2,
  Edit,
  Save,
  MapPin,
  Globe,
  Users,
  Award,
  MailCheck,
  PhoneCall,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Components & Utils
import { ROUTES } from '../../../utils/constants/routes';
import { 
  useUpdateMunicipalityMutation, 
  useGetMunicipalityByIdQuery,
} from '../../../store/api/Municipality';

// Boundary range options (in degrees)
const BOUNDARY_RANGES = [
  { label: 'Small (5km radius)', value: 0.045 },
  { label: 'Medium (10km radius)', value: 0.09 },
  { label: 'Large (20km radius)', value: 0.18 },
  { label: 'X-Large (30km radius)', value: 0.27 },
];

// Pre-defined report categories
const DEFAULT_REPORT_CATEGORIES = [
  'Road Damage',
  'Garbage Collection',
  'Water Supply',
  'Electricity Issue',
  'Sewage Problem',
  'Public Safety',
  'Street Lighting',
  'Drainage System',
  'Park Maintenance',
  'Noise Complaint'
];

// Validation Schema - Simplified for backend compatibility
const updateMunicipalitySchema = z.object({
  name: z.string()
    .min(2, 'Municipality name must be at least 2 characters')
    .max(100, 'Municipality name cannot exceed 100 characters')
    .optional(),

  location: z.object({
    city: z.string().optional(),
    province: z.string().optional(),
    coordinates: z.object({
      lat: z.number().min(-90).max(90).optional(),
      lng: z.number().min(-180).max(180).optional(),
    }).optional(),
  }).optional(),

  boundaryBox: z.object({
    minLat: z.number().min(-90).max(90).optional(),
    maxLat: z.number().min(-90).max(90).optional(),
    minLng: z.number().min(-180).max(180).optional(),
    maxLng: z.number().min(-180).max(180).optional(),
  }).optional(),

  contactEmail: z.string().email('Valid contact email is required').optional(),
  
  contactPhone: z.string()
    .regex(/^(\+977-?)?(98|97)\d{8}$/, 'Valid Nepali phone number is required')
    .optional(),

  settings: z.object({
    autoAssignReports: z.boolean().optional(),
    citizenRewards: z.boolean().optional(),
    pointValue: z.number().min(0, 'Point value must be 0 or greater').optional(),
  }).optional(),

  reportCategories: z.array(z.string()).optional(),

  isActive: z.boolean().optional(),
});

const EditMunicipality = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [updateMunicipality, { isLoading: isUpdating }] = useUpdateMunicipalityMutation();
  const { 
    data: responseData, 
    isLoading: isLoadingData, 
    error: loadError,
    refetch 
  } = useGetMunicipalityByIdQuery(id, {
    skip: !id,
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boundaryRange, setBoundaryRange] = useState(0.09);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('basic');
  const [hasLoadedData, setHasLoadedData] = useState(false);

  // Extract municipality data - Your data shows: {data: {municipality: {...}}, message: "...", status: "..."}
  const municipality = responseData?.data?.municipality || responseData?.municipality;
  console.log('API Response:', responseData);
  console.log('Extracted Municipality:', municipality);
  
  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid, isDirty },
  } = useForm({
    resolver: zodResolver(updateMunicipalitySchema),
    defaultValues: {
      name: '',
      location: {
        city: '',
        province: '',
        coordinates: { lat: 0, lng: 0 },
      },
      boundaryBox: {
        minLat: 0,
        maxLat: 0,
        minLng: 0,
        maxLng: 0,
      },
      contactEmail: '',
      contactPhone: '',
      settings: {
        autoAssignReports: false,
        citizenRewards: true,
        pointValue: 5,
      },
      reportCategories: [],
      isActive: true,
    },
    mode: 'onChange',
  });

  const formValues = watch();
  console.log('Current Form Values:', formValues);

  // Load municipality data
  useEffect(() => {
    if (municipality && !hasLoadedData) {
      console.log('Loading municipality data into form:', municipality);
      
      // Calculate center coordinates from boundary box if location coordinates are not available
      let centerLat = municipality.location?.coordinates?.lat || 0;
      let centerLng = municipality.location?.coordinates?.lng || 0;
      
      if (municipality.boundaryBox && (centerLat === 0 || centerLng === 0)) {
        centerLat = (municipality.boundaryBox.minLat + municipality.boundaryBox.maxLat) / 2;
        centerLng = (municipality.boundaryBox.minLng + municipality.boundaryBox.maxLng) / 2;
      }

      // Calculate boundary range
      if (municipality.boundaryBox) {
        const latRange = (municipality.boundaryBox.maxLat - municipality.boundaryBox.minLat) / 2;
        const lngRange = (municipality.boundaryBox.maxLng - municipality.boundaryBox.minLng) / 2;
        const avgRange = (latRange + lngRange) / 2;
        
        // Find closest boundary range
        const closestRange = BOUNDARY_RANGES.reduce((prev, curr) => 
          Math.abs(curr.value - avgRange) < Math.abs(prev.value - avgRange) ? curr : prev
        );
        setBoundaryRange(closestRange.value);
      }

      // Set selected categories
      if (municipality.reportCategories) {
        setSelectedCategories(municipality.reportCategories);
      }

      // Prepare form data
      const formData = {
        name: municipality.name || '',
        location: {
          city: municipality.location?.city || '',
          province: municipality.location?.province || '',
          coordinates: {
            lat: centerLat,
            lng: centerLng,
          },
        },
        boundaryBox: municipality.boundaryBox || {
          minLat: 0,
          maxLat: 0,
          minLng: 0,
          maxLng: 0,
        },
        contactEmail: municipality.contactEmail || '',
        contactPhone: municipality.contactPhone || '',
        settings: {
          autoAssignReports: municipality.settings?.autoAssignReports || false,
          citizenRewards: municipality.settings?.citizenRewards !== undefined ? municipality.settings.citizenRewards : true,
          pointValue: municipality.settings?.pointValue || 5,
        },
        reportCategories: municipality.reportCategories || [],
        isActive: municipality.isActive !== false,
      };

      console.log('Resetting form with data:', formData);
      reset(formData);
      setHasLoadedData(true);
    }
  }, [municipality, reset, hasLoadedData]);

  // Handle loading error
  useEffect(() => {
    if (loadError) {
      console.error('Load error:', loadError);
      toast.error(
        loadError.data?.message || 'Failed to load municipality data. Please try again.'
      );
      navigate(ROUTES.SYSTEM_ADMIN.MUNICIPALITIES);
    }
  }, [loadError, navigate]);

  // Calculate boundary box from coordinates and range
  const calculateBoundaryBox = (lat, lng, range) => {
    return {
      minLat: lat - range,
      maxLat: lat + range,
      minLng: lng - range,
      maxLng: lng + range
    };
  };

  // Update boundary box when coordinates or range changes
  useEffect(() => {
    const { lat, lng } = formValues.location?.coordinates || { lat: 0, lng: 0 };
    if (lat !== 0 && lng !== 0) {
      const boundaryBox = calculateBoundaryBox(lat, lng, boundaryRange);
      console.log('Updating boundary box:', boundaryBox);
      setValue('boundaryBox', boundaryBox, { shouldValidate: true });
    }
  }, [formValues.location?.coordinates, boundaryRange, setValue]);

  // Handle category selection
  const toggleCategory = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setValue('reportCategories', newCategories, { shouldValidate: true });
  };

  // Add custom category
  const addCustomCategory = () => {
    const customCategory = prompt('Enter new category name:');
    if (customCategory && customCategory.trim()) {
      const trimmedCategory = customCategory.trim();
      toggleCategory(trimmedCategory);
    }
  };

  // Remove category
  const removeCategory = (category) => {
    const newCategories = selectedCategories.filter(c => c !== category);
    setSelectedCategories(newCategories);
    setValue('reportCategories', newCategories, { shouldValidate: true });
  };

  // Form submission - Fixed for your API
  const onSubmit = async (data) => {
    if (isSubmitting || isUpdating) return;
    
    setIsSubmitting(true);
    
    console.log('Form data to submit:', data);
    console.log('Original municipality data:', municipality);
    
    // Prepare update data according to backend expectations
    const updateData = {};
    
    // Check each field and add if it's different from original or if it's being explicitly set
    if (data.name !== undefined && data.name !== municipality.name) {
      updateData.name = data.name;
    }
    
    if (data.contactEmail !== undefined && data.contactEmail !== municipality.contactEmail) {
      updateData.contactEmail = data.contactEmail;
    }
    
    if (data.contactPhone !== undefined && data.contactPhone !== municipality.contactPhone) {
      updateData.contactPhone = data.contactPhone;
    }
    
    if (data.isActive !== undefined && data.isActive !== municipality.isActive) {
      updateData.isActive = data.isActive;
    }
    
    // Check settings changes
    if (data.settings) {
      const originalSettings = municipality.settings || {};
      const settingsChanges = {};
      
      if (data.settings.autoAssignReports !== undefined && 
          data.settings.autoAssignReports !== originalSettings.autoAssignReports) {
        settingsChanges.autoAssignReports = data.settings.autoAssignReports;
      }
      
      if (data.settings.citizenRewards !== undefined && 
          data.settings.citizenRewards !== originalSettings.citizenRewards) {
        settingsChanges.citizenRewards = data.settings.citizenRewards;
      }
      
      if (data.settings.pointValue !== undefined && 
          data.settings.pointValue !== originalSettings.pointValue) {
        settingsChanges.pointValue = data.settings.pointValue;
      }
      
      if (Object.keys(settingsChanges).length > 0) {
        updateData.settings = settingsChanges;
      }
    }
    
    // Check report categories changes
    if (data.reportCategories) {
      const originalCategories = municipality.reportCategories || [];
      if (JSON.stringify(data.reportCategories.sort()) !== JSON.stringify(originalCategories.sort())) {
        updateData.reportCategories = data.reportCategories;
      }
    }
    
    // Check boundary box changes
    if (data.boundaryBox) {
      const originalBoundary = municipality.boundaryBox || {};
      const hasBoundaryChanges = 
        data.boundaryBox.minLat !== originalBoundary.minLat ||
        data.boundaryBox.maxLat !== originalBoundary.maxLat ||
        data.boundaryBox.minLng !== originalBoundary.minLng ||
        data.boundaryBox.maxLng !== originalBoundary.maxLng;
      
      if (hasBoundaryChanges) {
        updateData.boundaryBox = data.boundaryBox;
      }
    }
    
    console.log('Prepared update data:', updateData);
    
    // If nothing changed, show message and return
    if (Object.keys(updateData).length === 0) {
      toast.error('No changes detected. Please make changes before saving.');
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log('Sending update request:', {
        id,
        data: updateData
      });
      
      // Use the mutation hook correctly - it expects { id, ...data }
      const result = await updateMunicipality({
        id,
        ...updateData  // Spread the data object
      }).unwrap();
      
      console.log('Update successful:', result);
      
      toast.success(
        <div className="flex flex-col animate-fade-in">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-secondary-500 mr-2" />
            <span className="font-semibold text-lg">🏛 Municipality Updated Successfully!</span>
          </div>
          <span className="text-sm text-neutral-600">Changes have been saved successfully.</span>
        </div>,
        { duration: 5000 }
      );

      // Refetch and reset state
      await refetch();
      setHasLoadedData(false); // Allow data to be reloaded
      setIsSubmitting(false);
      
    } catch (error) {
      console.error('Update error:', error);
      
      // Enhanced error logging
      console.error('Error details:', {
        status: error.status,
        data: error.data,
        message: error.message,
        originalError: error.originalError
      });
      
      // Show appropriate error message
      const errorMessage = 
        error.data?.message || 
        error.message || 
        'Failed to update municipality. Please check your data and try again.';
      
      toast.error(errorMessage);
      setIsSubmitting(false);
    }
  };

  // Handle final submission
  const handleSaveClick = async () => {
    console.log('Save clicked, checking form validity...');
    
    const isValid = await trigger();
    console.log('Form is valid:', isValid);
    
    if (!isValid) {
      console.log('Form validation errors:', errors);
      toast.error('Please fix all errors before saving');
      return;
    }
    
    const formData = getValues();
    console.log('Form data to submit:', formData);
    
    await onSubmit(formData);
  };

  // Render tabs (keep the same as before)
  const renderTabContent = () => {
    switch (activeTab) {
      case 'basic':
        return (
          <motion.div
            key="basic"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-8">
              <div className="flex items-start mb-6">
                <div className="bg-primary-100 p-3 rounded-xl mr-4">
                  <Building2 className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Basic Information
                  </h3>
                  <p className="text-neutral-600">
                    Update municipality name and status
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Municipality Name *
                      </label>
                      <input
                        type="text"
                        {...field}
                        placeholder="Enter municipality name"
                        className={`w-full px-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Status
                      </label>
                      <div className="flex items-center space-x-4">
                        <button
                          type="button"
                          onClick={() => field.onChange(true)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            field.value === true
                              ? 'bg-success-100 text-success-700 border-2 border-success-500'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          Active
                        </button>
                        <button
                          type="button"
                          onClick={() => field.onChange(false)}
                          className={`px-6 py-3 rounded-lg font-medium transition-all ${
                            field.value === false
                              ? 'bg-danger-100 text-danger-700 border-2 border-danger-500'
                              : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                          }`}
                        >
                          Inactive
                        </button>
                      </div>
                      <p className="mt-2 text-sm text-neutral-500">
                        {field.value === true 
                          ? 'Municipality is active and accepting reports'
                          : 'Municipality is inactive and not accepting reports'
                        }
                      </p>
                    </div>
                  )}
                />
              </div>

              {/* Location Preview */}
              {formValues.location?.city && (
                <div className="mt-8 pt-6 border-t border-neutral-200">
                  <h4 className="font-semibold text-neutral-900 mb-4">Location Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg border border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-1">City</p>
                      <p className="font-semibold text-neutral-900">{formValues.location.city}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-neutral-200">
                      <p className="text-xs text-neutral-500 mb-1">Province</p>
                      <p className="font-semibold text-neutral-900">{formValues.location.province}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg border border-neutral-200">
                      <div className="flex items-center">
                        <Globe className="w-4 h-4 text-neutral-400 mr-2" />
                        <p className="text-sm text-neutral-600">Location coordinates are set</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 'contact':
        return (
          <motion.div
            key="contact"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-8">
              <div className="flex items-start mb-6">
                <div className="bg-primary-100 p-3 rounded-xl mr-4">
                  <MailCheck className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Contact Information
                  </h3>
                  <p className="text-neutral-600">
                    Update official contact details for the municipality
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="contactEmail"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Official Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          {...field}
                          placeholder="info@municipality.gov.np"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">This email will be shown to citizens</p>
                    </div>
                  )}
                />

                <Controller
                  name="contactPhone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Contact Phone *
                      </label>
                      <div className="relative">
                        <PhoneCall className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          {...field}
                          placeholder="98XXXXXXXX"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">Official municipality contact number</p>
                    </div>
                  )}
                />
              </div>
            </div>
          </motion.div>
        );

      case 'settings':
        return (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-8">
              <div className="flex items-start mb-6">
                <div className="bg-primary-100 p-3 rounded-xl mr-4">
                  <Settings className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Municipality Settings
                  </h3>
                  <p className="text-neutral-600">
                    Configure how this municipality operates on NagarAlert
                  </p>
                </div>
              </div>

              <div className="space-y-8">
                {/* System Settings */}
                <div className="space-y-6">
                  <h4 className="font-semibold text-neutral-900 text-lg">System Settings</h4>
                  
                  <Controller
                    name="settings.autoAssignReports"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
                        <div>
                          <p className="font-medium text-neutral-900">Auto-Assign Reports</p>
                          <p className="text-sm text-neutral-500">Automatically assign new reports to available staff</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    )}
                  />

                  <Controller
                    name="settings.citizenRewards"
                    control={control}
                    render={({ field }) => (
                      <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg hover:border-primary-300 transition-colors">
                        <div>
                          <p className="font-medium text-neutral-900">Citizen Reward System</p>
                          <p className="text-sm text-neutral-500">Enable points and rewards for citizen contributions</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.value || false}
                            onChange={field.onChange}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-500"></div>
                        </label>
                      </div>
                    )}
                  />

                  <div className="bg-white border border-neutral-200 rounded-xl p-6 hover:border-primary-300 transition-colors">
                    <label className="block text-sm font-medium text-neutral-700 mb-4">
                      Points per Report
                    </label>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-neutral-500">0</span>
                      <Controller
                        control={control}
                        name="settings.pointValue"
                        render={({ field }) => (
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={field.value || 0}
                            onChange={field.onChange}
                            className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider hover:bg-primary-200 transition-colors"
                            style={{
                              background: `linear-gradient(to right, #1DB6A9 0%, #1DB6A9 ${field.value || 0}%, #E0E0E0 ${field.value || 0}%, #E0E0E0 100%)`
                            }}
                          />
                        )}
                      />
                      <span className="text-sm text-neutral-500">100</span>
                      <div className="w-16 text-center">
                        <span className="text-lg font-bold text-primary-600">
                          {formValues.settings?.pointValue || 0}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-sm text-neutral-500">
                      Citizens earn this many points for each valid report they submit
                    </p>
                  </div>
                </div>

                {/* Report Categories */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-neutral-900 text-lg">Report Categories</h4>
                    <button
                      type="button"
                      onClick={addCustomCategory}
                      className="px-4 py-2 bg-primary-100 text-primary-700 hover:bg-primary-200 rounded-lg text-sm font-medium transition-colors"
                    >
                      + Add Custom
                    </button>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4">
                    Select the types of reports citizens can submit in this municipality
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-6">
                    {DEFAULT_REPORT_CATEGORIES.map((category) => (
                      <button
                        key={category}
                        type="button"
                        onClick={() => toggleCategory(category)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          selectedCategories.includes(category)
                            ? 'border-primary-500 bg-primary-50 text-primary-700 ring-2 ring-primary-100'
                            : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50 text-neutral-700'
                        }`}
                      >
                        <span className="text-sm font-medium">{category}</span>
                      </button>
                    ))}
                  </div>
                  
                  {selectedCategories.length > 0 && (
                    <div className="bg-primary-50 border border-primary-200 rounded-xl p-6">
                      <div className="flex items-center justify-between mb-3">
                        <p className="text-sm font-medium text-primary-900">
                          Selected Categories ({selectedCategories.length})
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCategories([]);
                            setValue('reportCategories', [], { shouldValidate: true });
                          }}
                          className="text-xs text-danger-600 hover:text-danger-700 hover:bg-danger-50 px-2 py-1 rounded"
                        >
                          Clear All
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectedCategories.map((category) => (
                          <div
                            key={category}
                            className="flex items-center bg-white border border-primary-200 rounded-lg px-3 py-2"
                          >
                            <span className="text-sm text-primary-700 mr-2">{category}</span>
                            <button
                              type="button"
                              onClick={() => removeCategory(category)}
                              className="text-neutral-400 hover:text-danger-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );

      case 'boundary':
        return (
          <motion.div
            key="boundary"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-200 rounded-2xl p-8">
              <div className="flex items-start mb-6">
                <div className="bg-primary-100 p-3 rounded-xl mr-4">
                  <Map className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Municipality Boundary
                  </h3>
                  <p className="text-neutral-600">
                    Set the geographical boundary for this municipality
                  </p>
                </div>
              </div>

              {/* Boundary Range Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-neutral-700 mb-4">
                  Select Boundary Size
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {BOUNDARY_RANGES.map((range) => (
                    <button
                      key={range.value}
                      type="button"
                      onClick={() => setBoundaryRange(range.value)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        boundaryRange === range.value
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-100'
                          : 'border-neutral-200 hover:border-primary-300 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center justify-center mb-2">
                        <Maximize2 className={`w-5 h-5 ${
                          boundaryRange === range.value ? 'text-primary-600' : 'text-neutral-400'
                        }`} />
                      </div>
                      <p className={`text-sm font-medium ${
                        boundaryRange === range.value ? 'text-primary-700' : 'text-neutral-700'
                      }`}>
                        {range.label}
                      </p>
                    </button>
                  ))}
                </div>
                <p className="mt-3 text-sm text-neutral-500">
                  This defines the geographical area where citizens can submit reports
                </p>
              </div>

              {/* Boundary Preview */}
              {formValues.boundaryBox && formValues.boundaryBox.minLat !== 0 && (
                <div className="bg-white border border-neutral-200 rounded-xl p-6">
                  <h4 className="font-semibold text-neutral-900 mb-4">Boundary Preview</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Min Latitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.minLat?.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Max Latitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.maxLat?.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Min Longitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.minLng?.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Max Longitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.maxLng?.toFixed(6)}°
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-700">
                      <span className="font-semibold">Area Coverage:</span> Approximately {Math.round(boundaryRange * 111 * 2)}km radius around {formValues.location?.city || 'the center'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      default:
        return null;
    }
  };

  // Loading state
  if (isLoadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <Loader2 className="w-12 h-12 text-primary-500 animate-spin mx-auto mb-4" />
              <p className="text-neutral-600">Loading municipality data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Show main content only when data is loaded
  if (!municipality) {
    console.log('No municipality data found after loading');
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
        <div className="max-w-6xl mx-auto px-4">
          <div className="bg-white rounded-3xl shadow-lg border border-neutral-100 p-8">
            <div className="text-center py-12">
              <AlertCircle className="w-16 h-16 text-danger-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-neutral-900 mb-2">Municipality Not Found</h3>
              <p className="text-neutral-600 mb-6">The municipality with ID "{id}" was not found.</p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => refetch()}
                  className="inline-flex items-center px-6 py-3 bg-primary-500 text-white font-semibold rounded-lg hover:bg-primary-600 transition-colors"
                >
                  <Loader2 className="w-5 h-5 mr-2" />
                  Retry Loading
                </button>
                <Link
                  to={ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}
                  className="inline-flex items-center px-6 py-3 bg-neutral-200 text-neutral-700 font-semibold rounded-lg hover:bg-neutral-300 transition-colors"
                >
                  Back to Municipalities
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center mb-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary-100 mr-3">
                  <Edit className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold text-neutral-900">
                    Edit Municipality
                  </h1>
                  <p className="text-neutral-600">
                    Update municipality details and settings
                  </p>
                </div>
              </div>
            </div>
            <Link
              to={ROUTES.SYSTEM_ADMIN.MUNICIPALITIES}
              className="px-4 py-2 text-neutral-700 hover:text-neutral-900 hover:bg-neutral-100 rounded-lg transition-colors"
            >
              ← Back to List
            </Link>
          </div>

          {/* Municipality Info Card */}
          <div className="bg-white rounded-2xl shadow border border-neutral-200 p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mr-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-neutral-900">{municipality.name}</h2>
                  <div className="flex items-center space-x-4 mt-1">
                    <div className="flex items-center text-sm text-neutral-600">
                      <MapPin className="w-4 h-4 mr-1" />
                      {municipality.location?.city}, {municipality.location?.province}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      municipality.isActive !== false 
                        ? 'bg-success-100 text-success-800' 
                        : 'bg-danger-100 text-danger-800'
                    }`}>
                      {municipality.isActive !== false ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-neutral-500">Municipality ID</p>
                <p className="font-mono text-sm text-neutral-700">{municipality._id?.slice(-8)}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-neutral-100 p-1 rounded-xl">
            {[
              { id: 'basic', label: 'Basic Info', icon: <Building2 size={16} /> },
              { id: 'contact', label: 'Contact', icon: <MailCheck size={16} /> },
              { id: 'settings', label: 'Settings', icon: <Settings size={16} /> },
              { id: 'boundary', label: 'Boundary', icon: <Map size={16} /> },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center px-4 py-2.5 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-primary-700 shadow-sm'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveClick();
            }} 
            className="p-8"
            noValidate
          >
            <AnimatePresence mode="wait">{renderTabContent()}</AnimatePresence>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-10 mt-10 border-t border-neutral-100">
              <div className="text-sm text-neutral-600">
                {isDirty && (
                  <div className="flex items-center">
                    <AlertCircle className="w-4 h-4 text-warning-600 mr-2" />
                    <span>You have unsaved changes</span>
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    // Reset to original municipality data
                    const originalData = {
                      name: municipality.name || '',
                      contactEmail: municipality.contactEmail || '',
                      contactPhone: municipality.contactPhone || '',
                      settings: {
                        autoAssignReports: municipality.settings?.autoAssignReports || false,
                        citizenRewards: municipality.settings?.citizenRewards !== undefined ? municipality.settings.citizenRewards : true,
                        pointValue: municipality.settings?.pointValue || 5,
                      },
                      reportCategories: municipality.reportCategories || [],
                      isActive: municipality.isActive !== false,
                    };
                    reset(originalData);
                    setSelectedCategories(municipality.reportCategories || []);
                  }}
                  disabled={!isDirty || isSubmitting}
                  className="px-6 py-3 text-neutral-700 hover:text-neutral-900 
                           hover:bg-neutral-100 rounded-xl transition-all duration-200 disabled:opacity-50 
                           border border-neutral-200 font-medium"
                >
                  Reset Changes
                </button>

                <motion.button
                  type="submit"
                  disabled={!isDirty || isSubmitting || !isValid}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 
                           text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-300 
                           transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isSubmitting || isUpdating) ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin mr-2" />
                      Saving Changes...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5 mr-2" />
                      Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </div>

            {/* Form Status */}
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm text-neutral-600">
                    All changes are validated before submission
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isValid
                        ? 'bg-success-100 text-success-800'
                        : 'bg-danger-100 text-danger-800'
                    }`}
                  >
                    {isValid ? '✓ Form Valid' : `${Object.keys(errors).length} Validation Errors`}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Last updated: {new Date(municipality.updatedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

        {/* Additional Info */}
        {municipality.adminId && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                <UserCog className="w-5 h-5 mr-2 text-primary-600" />
                Admin Information
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-neutral-500">Admin Name</p>
                  <p className="font-medium text-neutral-900">{municipality.adminId.name}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Email</p>
                  <p className="font-medium text-neutral-900">{municipality.adminId.email}</p>
                </div>
                <div>
                  <p className="text-xs text-neutral-500">Phone</p>
                  <p className="font-medium text-neutral-900">{municipality.adminId.phone}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-neutral-200 p-6">
              <h4 className="font-semibold text-neutral-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-primary-600" />
                Quick Stats
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-primary-50 p-4 rounded-lg">
                  <p className="text-xs text-primary-600 mb-1">Report Categories</p>
                  <p className="text-2xl font-bold text-primary-700">
                    {municipality.reportCategories?.length || 0}
                  </p>
                </div>
                <div className="bg-success-50 p-4 rounded-lg">
                  <p className="text-xs text-success-600 mb-1">Status</p>
                  <p className="text-2xl font-bold text-success-700">
                    {municipality.isActive !== false ? 'Active' : 'Inactive'}
                  </p>
                </div>
                <div className="bg-warning-50 p-4 rounded-lg">
                  <p className="text-xs text-warning-600 mb-1">Points per Report</p>
                  <p className="text-2xl font-bold text-warning-700">
                    {municipality.settings?.pointValue || 0}
                  </p>
                </div>
                <div className="bg-info-50 p-4 rounded-lg">
                  <p className="text-xs text-info-600 mb-1">Rewards</p>
                  <p className="text-2xl font-bold text-info-700">
                    {municipality.settings?.citizenRewards ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-8 text-center">
          <p className="text-sm text-neutral-500">
            Need help? Contact system administrator at 
            <a href="mailto:admin@nagaralert.gov.np" className="text-primary-600 hover:text-primary-700 ml-1 font-medium">
              admin@nagaralert.gov.np
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EditMunicipality;