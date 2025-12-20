import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  MapPin,
  Building2,
  UserCog,
  Settings,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Globe,
  Shield,
  Mail,
  Phone,
  Lock,
  AlertCircle,
  Sparkles,
  Map,
  Maximize2,
} from 'lucide-react';
import toast from 'react-hot-toast';

// Custom debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Components & Utils
import { ROUTES } from '../../../utils/constants/routes';
import { useCreateMunicipalityMutation } from '../../../store/api/Municipality';

// Environment variable for LocationIQ API Key
const LOCATIONIQ_API_KEY = "pk.5d73c73c12cc3a799c590072dc54e0e0";

// Boundary range options (in degrees)
const BOUNDARY_RANGES = [
  { label: 'Small (5km radius)', value: 0.045 },
  { label: 'Medium (10km radius)', value: 0.09 },
  { label: 'Large (20km radius)', value: 0.18 },
  { label: 'X-Large (30km radius)', value: 0.27 },
];

// Validation Schema
const municipalitySchema = z.object({
  name: z.string().min(2, 'Municipality name must be at least 2 characters').max(100),
  
  location: z.object({
    city: z.string().min(1, 'City is required'),
    province: z.string().min(1, 'Province is required'),
    coordinates: z.object({
      lat: z.number().min(-90).max(90),
      lng: z.number().min(-180).max(180),
    }),
  }),

  // New boundaryBox field
  boundaryBox: z.object({
    minLat: z.number().min(-90).max(90),
    maxLat: z.number().min(-90).max(90),
    minLng: z.number().min(-180).max(180),
    maxLng: z.number().min(-180).max(180),
  }).optional(),

  contactEmail: z.string().email('Please enter a valid email'),
  contactPhone: z.string()
    .regex(/^(\+977-?)?(98|97)\d{8}$/, 'Please enter a valid Nepali number (98/97XXXXXXXX)'),

  adminUser: z.object({
    name: z.string().min(2, 'Admin name must be at least 2 characters'),
    email: z.string().email('Please enter a valid admin email'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    phone: z.string()
      .regex(/^(\+977-?)?(98|97)\d{8}$/, 'Please enter a valid Nepali number'),
  }),

  settings: z.object({
    autoAssignReports: z.boolean().default(false),
    citizenRewards: z.boolean().default(true),
    pointValue: z.number().min(1).max(100).default(5),
  }),
  
  // New reportCategories field
  reportCategories: z.array(z.string()).optional(),
}).refine((data) => data.location.coordinates.lat !== 0 && data.location.coordinates.lng !== 0, {
  message: 'Please select a valid municipality location',
  path: ['location'],
}).refine((data) => {
  // Ensure boundary coordinates are valid if provided
  if (data.boundaryBox) {
    return (
      data.boundaryBox.minLat < data.boundaryBox.maxLat &&
      data.boundaryBox.minLng < data.boundaryBox.maxLng
    );
  }
  return true;
}, {
  message: 'Invalid boundary coordinates',
  path: ['boundaryBox'],
});

const CreateMunicipality = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [createMunicipality, { isLoading }] = useCreateMunicipalityMutation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedResult, setSelectedResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [boundaryRange, setBoundaryRange] = useState(0.09); // Default to medium (10km)
  const [reportCategories, setReportCategories] = useState([
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
  ]);
  const [selectedCategories, setSelectedCategories] = useState([]);

  // Form setup
  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    getValues,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(municipalitySchema),
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
      adminUser: {
        name: '',
        email: '',
        password: '',
        phone: '',
      },
      settings: {
        autoAssignReports: false,
        citizenRewards: true,
        pointValue: 5,
      },
      reportCategories: [],
    },
    mode: 'onChange',
  });

  const formValues = watch();
  
  // Steps configuration with teal color scheme
  const steps = [
    { number: 1, title: 'Search', subtitle: 'Find Municipality', icon: <Search size={18} /> },
    { number: 2, title: 'Boundary', subtitle: 'Set Coverage', icon: <Map size={18} /> },
    { number: 3, title: 'Contact', subtitle: 'Official Details', icon: <Mail size={18} /> },
    { number: 4, title: 'Admin', subtitle: 'Admin Account', icon: <UserCog size={18} /> },
    { number: 5, title: 'Settings', subtitle: 'Configuration', icon: <Settings size={18} /> },
  ];

  // Helper function for teal color scheme
  const getColorClass = () => {
    return {
      bg: 'bg-primary-500',
      bgLight: 'bg-primary-100',
      text: 'text-primary-600',
      border: 'border-primary-200',
      gradient: 'from-primary-50 to-white',
      progress: 'bg-primary-500',
      ring: 'ring-primary-200'
    };
  };

  const colorClasses = getColorClass();

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
    const { lat, lng } = formValues.location.coordinates;
    if (lat !== 0 && lng !== 0) {
      const boundaryBox = calculateBoundaryBox(lat, lng, boundaryRange);
      setValue('boundaryBox', boundaryBox, { shouldValidate: true });
    }
  }, [formValues.location.coordinates, boundaryRange, setValue]);

  // Search municipalities with debounce
  const searchMunicipalities = React.useCallback(
    debounce(async (query) => {
      if (!query || query.length < 3) {
        setSearchResults([]);
        return;
      }

      if (!LOCATIONIQ_API_KEY) {
        console.error('LocationIQ API key is not configured');
        toast.error('Location service is not configured. Please contact administrator.');
        return;
      }

      setIsSearching(true);
      try {
        const response = await fetch(
          `https://us1.locationiq.com/v1/search?key=${LOCATIONIQ_API_KEY}&q=${encodeURIComponent(query + ', Nepal')}&format=json&limit=5`
        );
        
        if (!response.ok) throw new Error('Search failed');
        
        const data = await response.json();
        
        // Filter for city/administrative results in Nepal
        const filtered = data.filter(item => 
          (item.type === 'city' || item.type === 'administrative') &&
          item.display_name.includes('Nepal')
        );
        
        setSearchResults(filtered);
      } catch (error) {
        console.error('Search error:', error);
        toast.error('Failed to search. Please try again.');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [LOCATIONIQ_API_KEY]
  );

  // Handle search query changes
  useEffect(() => {
    searchMunicipalities(searchQuery);
  }, [searchQuery, searchMunicipalities]);

  // Handle selection of a search result
  const handleSelectResult = (result) => {
    setSelectedResult(result);
    
    // Extract city and province from display_name
    const displayParts = result.display_name.split(', ');
    const city = displayParts[0];
    const province = displayParts.find(part => 
      part.includes('Province') || 
      ['Bagmati', 'Gandaki', 'Lumbini', 'Karnali', 'Sudurpashchim', 'Province 1', 'Madhesh'].includes(part)
    ) || '';
    
    // Parse coordinates
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    // Update form values
    setValue('name', result.display_name.split(',')[0], { shouldValidate: true });
    setValue('location.city', city, { shouldValidate: true });
    setValue('location.province', province.replace(' Province', ''), { shouldValidate: true });
    setValue('location.coordinates', {
      lat: lat,
      lng: lng,
    }, { shouldValidate: true });
    
    // Calculate and set boundary box
    const boundaryBox = calculateBoundaryBox(lat, lng, boundaryRange);
    setValue('boundaryBox', boundaryBox, { shouldValidate: true });
    
    // Clear search
    setSearchQuery('');
    setSearchResults([]);
    
    toast.success(
      <div className="flex items-center">
        <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
        <span>Selected <strong>{city}</strong></span>
      </div>
    );
  };

  // Handle category selection
  const toggleCategory = (category) => {
    const newCategories = selectedCategories.includes(category)
      ? selectedCategories.filter(c => c !== category)
      : [...selectedCategories, category];
    
    setSelectedCategories(newCategories);
    setValue('reportCategories', newCategories, { shouldValidate: true });
  };

  // Form navigation
  const nextStep = async () => {
    const stepValidations = {
      1: ['name', 'location.city', 'location.province', 'location.coordinates'],
      2: ['boundaryBox'],
      3: ['contactEmail', 'contactPhone'],
      4: ['adminUser.name', 'adminUser.email', 'adminUser.password', 'adminUser.phone'],
      5: ['settings', 'reportCategories'],
    };

    const fieldsToValidate = stepValidations[step] || [];
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid) {
      setStep(prev => Math.min(prev + 1, steps.length));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      toast.error(`Please complete all required fields in "${steps[step-1]?.title}" step`);
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Prevent form submission on Enter key
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.type !== 'submit') {
      e.preventDefault();
      
      if (step < steps.length) {
        nextStep();
      }
    }
  };

  // Form submission - Only on button click
  const onSubmit = async (data) => {
    // Prevent multiple submissions
    if (isSubmitting || isLoading) return;
    
    setIsSubmitting(true);
    
    console.log('Submitting municipality data:', data);
    
    try {
      const result = await createMunicipality(data).unwrap();
      
      toast.success(
        <div className="flex flex-col animate-fade-in">
          <div className="flex items-center mb-2">
            <Sparkles className="w-5 h-5 text-secondary-500 mr-2" />
            <span className="font-semibold text-lg">🏛 Municipality Created Successfully!</span>
          </div>
          <span className="text-sm text-neutral-600">Admin account has been created. Check email for login details.</span>
        </div>,
        { duration: 5000 }
      );

      // Reset form and navigate
      reset();
      setSelectedResult(null);
      setSelectedCategories([]);
      setBoundaryRange(0.09);
      setIsSubmitting(false);
      navigate(ROUTES.SYSTEM_ADMIN.DASHBOARD, { replace: true });
      
    } catch (error) {
      console.error('Municipality creation error:', error);
      toast.error(
        error.data?.message || 'Failed to create municipality. Please try again.'
      );
      setIsSubmitting(false);
    }
  };

  // Handle final submission button click
  const handleCreateClick = async (e) => {
    e.preventDefault();
    
    // Validate all steps before submission
    const allFields = [
      'name', 'location.city', 'location.province', 'location.coordinates',
      'boundaryBox.minLat', 'boundaryBox.maxLat', 'boundaryBox.minLng', 'boundaryBox.maxLng',
      'contactEmail', 'contactPhone',
      'adminUser.name', 'adminUser.email', 'adminUser.password', 'adminUser.phone',
      'settings.autoAssignReports', 'settings.citizenRewards', 'settings.pointValue',
      'reportCategories'
    ];
    
    const isValid = await trigger(allFields);
    
    if (!isValid) {
      toast.error('Please complete all required fields before submitting');
      return;
    }
    
    if (!selectedResult) {
      toast.error('Please select a municipality location');
      setStep(1);
      return;
    }
    
    // Get form data and submit
    const formData = getValues();
    onSubmit(formData);
  };

  // Render current step
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 animate-fade-in"
          >
            <div className={`bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-start mb-6">
                <div className={`${colorClasses.bgLight} p-3 rounded-xl mr-4`}>
                  <Search className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Find Municipality
                  </h3>
                  <p className="text-neutral-600">
                    Search for a municipality in Nepal. All location details will be auto-filled.
                  </p>
                </div>
              </div>

              {/* Search Input */}
              <div className="relative mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search municipality (e.g., Kathmandu, Pokhara, Biratnagar)..."
                    className="w-full pl-12 pr-10 py-4 border-2 border-neutral-200 rounded-xl 
                             focus:border-primary-500 focus:ring-2 focus:ring-primary-200 
                             transition-all duration-200 placeholder-neutral-400"
                  />
                  {isSearching && (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
                    </div>
                  )}
                </div>

                {/* Search Results */}
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute z-30 w-full mt-2 bg-white border border-neutral-200 rounded-xl shadow-xl"
                  >
                    <div className="p-3 border-b border-neutral-100 bg-neutral-50">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-neutral-700">Search Results</span>
                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded">
                          {searchResults.length} found
                        </span>
                      </div>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {searchResults.map((result) => (
                        <div
                          key={result.place_id}
                          onClick={() => handleSelectResult(result)}
                          className="p-4 hover:bg-neutral-50 cursor-pointer border-b border-neutral-100 last:border-b-0 transition-colors"
                        >
                          <div className="flex items-start">
                            <div className="bg-primary-100 p-2 rounded-lg mr-3">
                              <MapPin className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-semibold text-neutral-900">
                                {result.display_name.split(',')[0]}
                              </h4>
                              <p className="text-sm text-neutral-600 mt-1">
                                {result.display_name.split(', ').slice(1).join(', ')}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-neutral-500">
                                <span className="font-mono bg-neutral-100 px-2 py-1 rounded">
                                  {result.lat}, {result.lon}
                                </span>
                                <span className="ml-2 px-2 py-1 bg-primary-100 text-primary-700 rounded">
                                  {result.type}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Selected Municipality Preview */}
              {selectedResult && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-gradient-to-r from-primary-50 to-white border border-primary-200 rounded-xl p-6"
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center">
                      <div className="bg-primary-100 p-2 rounded-lg mr-3">
                        <CheckCircle className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-primary-900">Municipality Selected</h4>
                        <p className="text-sm text-primary-700">All location details auto-filled</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedResult(null);
                        setValue('name', '');
                        setValue('location.city', '');
                        setValue('location.province', '');
                        setValue('location.coordinates', { lat: 0, lng: 0 });
                        setValue('boundaryBox', {
                          minLat: 0,
                          maxLat: 0,
                          minLng: 0,
                          maxLng: 0,
                        });
                      }}
                      className="text-sm text-danger-600 hover:text-danger-700 hover:bg-danger-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Municipality Name</p>
                        <p className="font-semibold text-neutral-900">{getValues('name')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">City</p>
                        <p className="font-semibold text-neutral-900">{getValues('location.city')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Province</p>
                        <p className="font-semibold text-neutral-900">{getValues('location.province')}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <p className="text-xs text-neutral-500 mb-1">Coordinates</p>
                        <div className="flex items-center space-x-4">
                          <div className="bg-white p-3 rounded-lg border border-neutral-200">
                            <p className="text-xs text-neutral-500">Latitude</p>
                            <p className="font-mono font-bold text-neutral-800">
                              {getValues('location.coordinates.lat')?.toFixed(6)}°
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-neutral-200">
                            <p className="text-xs text-neutral-500">Longitude</p>
                            <p className="font-mono font-bold text-neutral-800">
                              {getValues('location.coordinates.lng')?.toFixed(6)}°
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white p-4 rounded-lg border border-neutral-200">
                        <div className="flex items-center">
                          <Globe className="w-4 h-4 text-neutral-400 mr-2" />
                          <p className="text-sm text-neutral-600">Location verified via LocationIQ API</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {!selectedResult && searchQuery.length >= 3 && searchResults.length === 0 && !isSearching && (
                <div className="mt-4 p-4 bg-warning-50 border border-warning-200 rounded-xl">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-warning-600 mr-2" />
                    <p className="text-sm text-warning-700">
                      No municipality found. Try a different name or check spelling.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 animate-fade-in"
          >
            <div className={`bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-start mb-6">
                <div className={`${colorClasses.bgLight} p-3 rounded-xl mr-4`}>
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
                        {formValues.boundaryBox.minLat.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Max Latitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.maxLat.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Min Longitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.minLng.toFixed(6)}°
                      </p>
                    </div>
                    <div className="bg-neutral-50 p-4 rounded-lg">
                      <p className="text-xs text-neutral-500 mb-1">Max Longitude</p>
                      <p className="font-mono font-semibold text-neutral-800">
                        {formValues.boundaryBox.maxLng.toFixed(6)}°
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <p className="text-sm text-primary-700">
                      <span className="font-semibold">Area Coverage:</span> Approximately {Math.round(boundaryRange * 111 * 2)}km radius around {formValues.location.city}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 animate-fade-in"
          >
            <div className={`bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-start mb-6">
                <div className={`${colorClasses.bgLight} p-3 rounded-xl mr-4`}>
                  <Mail className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Contact Information
                  </h3>
                  <p className="text-neutral-600">
                    Official contact details for the municipality
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
                          onKeyDown={handleKeyDown}
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
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          {...field}
                          onKeyDown={handleKeyDown}
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

      case 4:
        return (
          <motion.div
            key="step4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 animate-fade-in"
          >
            <div className={`bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-start mb-6">
                <div className={`${colorClasses.bgLight} p-3 rounded-xl mr-4`}>
                  <UserCog className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-neutral-900 mb-2">
                    Admin Account Setup
                  </h3>
                  <p className="text-neutral-600">
                    Create the municipality admin account
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Controller
                  name="adminUser.name"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Admin Full Name *
                      </label>
                      <input
                        type="text"
                        {...field}
                        onKeyDown={handleKeyDown}
                        placeholder="Enter admin's full name"
                        className={`w-full px-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                      />
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="adminUser.email"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Admin Email *
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="email"
                          {...field}
                          onKeyDown={handleKeyDown}
                          placeholder="admin@municipality.gov.np"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />

                <Controller
                  name="adminUser.password"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Admin Password *
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="password"
                          {...field}
                          onKeyDown={handleKeyDown}
                          placeholder="Create a strong password"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                      <p className="mt-1 text-xs text-neutral-500">Minimum 6 characters</p>
                    </div>
                  )}
                />

                <Controller
                  name="adminUser.phone"
                  control={control}
                  render={({ field, fieldState }) => (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Admin Phone *
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                        <input
                          type="tel"
                          {...field}
                          onKeyDown={handleKeyDown}
                          placeholder="98XXXXXXXX"
                          className={`w-full pl-10 pr-4 py-3 rounded-lg border ${fieldState.error ? 'border-danger-300 focus:border-danger-500 focus:ring-danger-200' : 'border-neutral-300 focus:border-primary-500 focus:ring-2 focus:ring-primary-200'} focus:ring-opacity-20 transition-colors`}
                        />
                      </div>
                      {fieldState.error && (
                        <p className="mt-1 text-sm text-danger-600">{fieldState.error.message}</p>
                      )}
                    </div>
                  )}
                />
              </div>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            key="step5"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8 animate-fade-in"
          >
            <div className={`bg-gradient-to-br ${colorClasses.gradient} border ${colorClasses.border} rounded-2xl p-8 shadow-md hover:shadow-lg transition-shadow duration-300`}>
              <div className="flex items-start mb-6">
                <div className={`${colorClasses.bgLight} p-3 rounded-xl mr-4`}>
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
                            checked={field.value}
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
                            checked={field.value}
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
                      <span className="text-sm text-neutral-500">1</span>
                      <Controller
                        control={control}
                        name="settings.pointValue"
                        render={({ field }) => (
                          <input
                            type="range"
                            min="1"
                            max="100"
                            value={field.value}
                            onChange={field.onChange}
                            className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer slider hover:bg-primary-200 transition-colors"
                            style={{
                              background: `linear-gradient(to right, #1DB6A9 0%, #1DB6A9 ${field.value}%, #E0E0E0 ${field.value}%, #E0E0E0 100%)`
                            }}
                          />
                        )}
                      />
                      <span className="text-sm text-neutral-500">100</span>
                      <div className="w-16 text-center">
                        <span className="text-lg font-bold text-primary-600">
                          {formValues.settings.pointValue}
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
                  <h4 className="font-semibold text-neutral-900 text-lg mb-4">Report Categories</h4>
                  <p className="text-sm text-neutral-600 mb-4">
                    Select the types of reports citizens can submit in this municipality
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                    {reportCategories.map((category) => (
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
                    <div className="mt-6 p-4 bg-primary-50 border border-primary-200 rounded-xl">
                      <p className="text-sm text-primary-700">
                        <span className="font-semibold">{selectedCategories.length} categories selected:</span> {selectedCategories.join(', ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-white py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10 text-center"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary-100 mb-4">
            <Building2 className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
            Register New Municipality
          </h1>
          <p className="text-neutral-600 max-w-2xl mx-auto">
            Add a new municipality to NagarAlert platform. Search for municipality and all details will be auto-filled.
          </p>
        </motion.div>

        {/* Progress Steps */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-8">
            {steps.map((s, index) => {
              const isCompleted = step > s.number;
              const isCurrent = step === s.number;
              
              return (
                <React.Fragment key={s.number}>
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center relative z-10"
                  >
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center border-2 relative
                        ${isCompleted || isCurrent 
                          ? `${colorClasses.bg} border-primary-300 text-white shadow-md` 
                          : 'border-neutral-200 bg-white text-neutral-400'
                        }
                        transition-all duration-300
                      `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : (
                        <>
                          <div className="p-2">{s.icon}</div>
                          <span
                            className={`absolute -top-2 -right-2 w-8 h-8 ${colorClasses.bg} text-white text-sm font-bold rounded-full flex items-center justify-center border-4 border-white shadow`}
                          >
                            {s.number}
                          </span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 text-center">
                      <p
                        className={`text-sm font-semibold ${
                          isCompleted || isCurrent ? 'text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        {s.title}
                      </p>
                      <p className="text-xs text-neutral-400 mt-0.5">{s.subtitle}</p>
                    </div>
                  </motion.div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 mx-4 h-1 relative">
                      <div className="absolute inset-0 bg-neutral-200 rounded-full"></div>
                      <motion.div
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: step > s.number ? 1 : 0 }}
                        className={`absolute inset-0 ${colorClasses.progress} rounded-full origin-left transition-all duration-300`}
                      />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-lg border border-neutral-100 overflow-hidden hover:shadow-xl transition-shadow duration-300"
        >
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              // Only handle submission on explicit button click
            }} 
            className="p-8"
            noValidate
          >
            <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-10 mt-10 border-t border-neutral-100">
              <div>
                {step > 1 && (
                  <motion.button
                    type="button"
                    onClick={prevStep}
                    disabled={isLoading || isSubmitting}
                    whileHover={{ x: -3 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center px-6 py-3.5 text-neutral-700 hover:text-neutral-900 
                             hover:bg-neutral-100 rounded-xl transition-all duration-200 disabled:opacity-50 
                             border border-neutral-200 font-medium"
                  >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    Back to {steps[step - 2]?.title}
                  </motion.button>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {step < steps.length ? (
                  <motion.button
                    type="button"
                    onClick={nextStep}
                    disabled={isLoading || isSubmitting}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center px-8 py-3.5 ${colorClasses.bg} 
                             text-white font-semibold rounded-xl 
                             hover:shadow-lg transition-all duration-200 shadow-md disabled:opacity-50`}
                  >
                    Continue
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </motion.button>
                ) : (
                  <motion.button
                    type="button" // Changed to type="button" to prevent auto-submit
                    onClick={handleCreateClick}
                    disabled={isLoading || !isValid || !selectedResult || isSubmitting}
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center px-10 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 
                             text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-300 
                             transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                             relative overflow-hidden group"
                  >
                    <span className="relative z-10 flex items-center">
                      {(isLoading || isSubmitting) ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin mr-2" />
                          Creating Municipality...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5 mr-2" />
                          Create Municipality
                        </>
                      )}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>

            {/* Form Status */}
            <div className="mt-8 pt-6 border-t border-neutral-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Shield className="w-4 h-4 text-primary-500 mr-2" />
                  <span className="text-sm text-neutral-600">
                    All data is encrypted and securely stored
                  </span>
                </div>
                <div className="flex items-center space-x-4">
                  <div
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      isValid && selectedResult
                        ? 'bg-primary-100 text-primary-800'
                        : 'bg-warning-100 text-warning-800'
                    }`}
                  >
                    {isValid && selectedResult
                      ? '✓ Ready to Submit'
                      : `${Object.keys(errors).length} Issues`}
                  </div>
                  <div className="text-xs text-neutral-500">
                    Step {step} of {steps.length}
                    {!selectedResult && step === 1 && ' • Select a municipality'}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </motion.div>

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

export default CreateMunicipality;