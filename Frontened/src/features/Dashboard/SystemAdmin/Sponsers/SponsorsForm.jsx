import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { useCreateSponsorMutation, useUpdateSponsorMutation } from '../../../../store/api/sponsors';


// Yup validation schema matching backend
const sponsorSchema = yup.object({
  name: yup
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must not exceed 100 characters')
    .required('Name is required'),
  
  contactEmail: yup
    .string()
    .email('Valid email is required')
    .required('Email is required'),
  
  contactPhone: yup
    .string()
    .matches(
      /^(\+977-?)?(98|97)\d{8}$/,
      'Valid Nepali phone number is required (98/97XXXXXXXX)'
    )
    .required('Phone number is required'),
  
  sponsorType: yup
    .string()
    .oneOf(
      [
        'local_business', 
        'corporate', 
        'ngo', 
        'community_event', 
        'music_program', 
        'party_event',
        'csr_campaign',
        'government_scheme',
        'public_awareness'
      ],
      'Invalid sponsor type'
    )
    .required('Sponsor type is required'),
  
  title: yup
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must not exceed 200 characters')
    .required('Title is required'),
  
  description: yup
    .string()
    .max(500, 'Description must not exceed 500 characters')
    .nullable(),
  
  website: yup
    .string()
    .url('Valid website URL is required')
    .nullable(),
  
  scope: yup
    .string()
    .oneOf(['global', 'municipality'], 'Invalid scope')
    .default('global')
    .required(),
  
  municipalityId: yup
    .string()
    .when('scope', {
      is: 'municipality',
      then: (schema) => schema
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid municipality ID')
        .required('Municipality is required for municipal scope'),
      otherwise: (schema) => schema.nullable()
    }),
  
  startDate: yup
    .date()
    .typeError('Start date must be a valid date')
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),
  
  endDate: yup
    .date()
    .typeError('End date must be a valid date')
    .min(
      yup.ref('startDate'),
      'End date must be after start date'
    )
    .required('End date is required')
});

const SponsorForm = ({ 
  sponsorId = null, // For editing
  initialData = null, 
  municipalities = [], 
}) => {
  const navigate = useNavigate();
  const [bannerImage, setBannerImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(initialData?.bannerImage || '');
  const [fileError, setFileError] = useState('');
  
  // RTK Query mutations
  const [createSponsor, { isLoading: isCreating }] = useCreateSponsorMutation();
  const [updateSponsor, { isLoading: isUpdating }] = useUpdateSponsorMutation();
  
  const isEditing = !!sponsorId;
  const isSubmitting = isCreating || isUpdating;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    reset,
    formState: { errors, isValid },
  } = useForm({
    resolver: yupResolver(sponsorSchema),
    defaultValues: initialData || {
      name: '',
      contactEmail: '',
      contactPhone: '',
      sponsorType: 'corporate',
      title: '',
      description: '',
      website: '',
      scope: 'global',
      municipalityId: '',
      startDate: '',
      endDate: ''
    },
    mode: 'onChange'
  });

  // Watch scope for conditional rendering
  const watchScope = watch('scope', 'global');
  const watchStartDate = watch('startDate');
  const watchDescription = watch('description', '');

  // Handle image upload with validation
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    setFileError('');
    
    if (!file) return;
    
    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setFileError('Please upload a valid image (JPEG, PNG, GIF, WebP)');
      return;
    }
    
    // Validate file size (5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB in bytes
    if (file.size > maxSize) {
      setFileError('Image size must be less than 5MB');
      return;
    }
    
    setBannerImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Handle scope change
  const handleScopeChange = (value) => {
    setValue('scope', value, { shouldValidate: true });
    
    // Clear municipality if switching to global
    if (value === 'global') {
      setValue('municipalityId', '', { shouldValidate: true });
    }
  };

  // Handle form submission
  const onSubmitForm = async (data) => {
    try {
      const formData = new FormData();
      
      // Append all form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined && data[key] !== '') {
          // Convert dates to string format
          if (key === 'startDate' || key === 'endDate') {
            const date = new Date(data[key]);
            formData.append(key, date.toISOString());
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Append banner image if exists
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }
      
      // Validate image for create operation
      if (!isEditing && !bannerImage) {
        setFileError('Banner image is required');
        return;
      }

      console.log('Submitting form data...');
      
      let result;
      if (isEditing) {
        // Update existing sponsor
        console.log('Updating sponsor with ID:', sponsorId);
        result = await updateSponsor({ 
          id: sponsorId, 
          ...formData 
        }).unwrap();
        toast.success('Sponsor updated successfully!');
      } else {
        // Create new sponsor
        console.log('Creating new sponsor');
        result = await createSponsor(formData).unwrap();
        toast.success('Sponsor created successfully!');
      }
      
      console.log('Form submission result:', result);
      
      // Navigate back to sponsors list or show success
      setTimeout(() => {
        navigate('/sponsors'); // Adjust the route as needed
      }, 1500);
      
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage = error?.data?.message || error?.error || 'Failed to save sponsor. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Calculate min end date
  const getMinEndDate = () => {
    if (!watchStartDate) return new Date().toISOString().split('T')[0];
    const nextDay = new Date(watchStartDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  // Sponsor type options
  const sponsorTypeOptions = [
    { value: 'local_business', label: 'Local Business' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'ngo', label: 'NGO' },
    { value: 'community_event', label: 'Community Event' },
    { value: 'music_program', label: 'Music Program' },
    { value: 'party_event', label: 'Party Event' },
    { value: 'csr_campaign', label: 'CSR Campaign' },
    { value: 'government_scheme', label: 'Government Scheme' },
    { value: 'public_awareness', label: 'Public Awareness' }
  ];

  // Calculate date minimums
  const today = new Date().toISOString().split('T')[0];
  const minEndDate = getMinEndDate();

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        {isEditing ? 'Edit Sponsor' : 'Add New Sponsor'}
      </h1>
      <p className="text-gray-600 mb-8">
        {isEditing ? 'Update sponsor campaign details' : 'Create a new advertising campaign or sponsor entry'}
      </p>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8" noValidate>
        {/* Banner Image Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-4">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600">📌</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Banner Image {!isEditing && '*'}</h2>
          </div>
          <p className="text-gray-600 mb-4">
            Upload a banner image for the sponsor campaign {!isEditing && '(required)'}
          </p>
          
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
            {imagePreview ? (
              <div className="mb-4">
                <img 
                  src={imagePreview} 
                  alt="Banner preview" 
                  className="max-h-48 mx-auto rounded-lg object-cover"
                />
              </div>
            ) : (
              <div className="py-8">
                <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-2xl">📷</span>
                </div>
                <p className="text-gray-500 mb-2">Drag & drop or click to upload</p>
                <p className="text-sm text-gray-400">PNG, JPG, GIF, WebP up to 5MB</p>
              </div>
            )}
            
            <label className="inline-block mt-4 cursor-pointer">
              <span className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path>
                </svg>
                Choose File
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="bannerImage"
                name="bannerImage"
              />
            </label>
            <p className="mt-2 text-sm text-gray-500">
              {bannerImage ? bannerImage.name : 'No file chosen'}
            </p>
            {fileError && (
              <p className="mt-2 text-sm text-red-600">{fileError}</p>
            )}
          </div>
        </div>

        {/* Sponsor Information Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600">🏢</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Sponsor Information</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Sponsor Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Name *
              </label>
              <input
                {...register('name')}
                type="text"
                id="name"
                name="name"
                placeholder="Company/Organization name"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onBlur={() => trigger('name')}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Contact Email */}
            <div>
              <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Email *
              </label>
              <input
                {...register('contactEmail')}
                type="email"
                id="contactEmail"
                name="contactEmail"
                placeholder="contact@company.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.contactEmail ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onBlur={() => trigger('contactEmail')}
              />
              {errors.contactEmail && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.contactEmail.message}
                </p>
              )}
            </div>

            {/* Website */}
            <div>
              <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                Website
              </label>
              <input
                {...register('website')}
                type="url"
                id="website"
                name="website"
                placeholder="https://www.example.com"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.website ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onBlur={() => trigger('website')}
              />
              {errors.website && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.website.message}
                </p>
              )}
            </div>

            {/* Sponsor Type */}
            <div>
              <label htmlFor="sponsorType" className="block text-sm font-medium text-gray-700 mb-2">
                Sponsor Type *
              </label>
              <select
                {...register('sponsorType')}
                id="sponsorType"
                name="sponsorType"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.sponsorType ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  setValue('sponsorType', e.target.value);
                  trigger('sponsorType');
                }}
              >
                {sponsorTypeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors.sponsorType && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.sponsorType.message}
                </p>
              )}
            </div>

            {/* Contact Phone */}
            <div>
              <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-2">
                Contact Phone *
              </label>
              <input
                {...register('contactPhone')}
                type="tel"
                id="contactPhone"
                name="contactPhone"
                placeholder="+977-98XXXXXXXX"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.contactPhone ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onBlur={() => trigger('contactPhone')}
              />
              <p className="mt-1 text-xs text-gray-500">Format: +977-98XXXXXXXX or 97XXXXXXXX</p>
              {errors.contactPhone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.contactPhone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Campaign Details Section */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-blue-600">📋</span>
            </div>
            <h2 className="text-lg font-semibold text-gray-800">Campaign Details</h2>
          </div>

          {/* Campaign Title */}
          <div className="mb-6">
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Title *
            </label>
            <input
              {...register('title')}
              type="text"
              id="title"
              name="title"
              placeholder="Enter campaign title"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.title ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              onBlur={() => trigger('title')}
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.title.message}
              </p>
            )}
          </div>

          {/* Description */}
          <div className="mb-6">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              {...register('description')}
              id="description"
              name="description"
              rows={4}
              placeholder="Enter campaign description (max 500 characters)"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                errors.description ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
              maxLength={500}
              onChange={(e) => {
                setValue('description', e.target.value);
                trigger('description');
              }}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.description ? (
                <p className="text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.description.message}
                </p>
              ) : (
                <div></div>
              )}
              <p className="text-xs text-gray-500">
                {watchDescription.length}/500 characters
              </p>
            </div>
          </div>

          {/* Scope Selection */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Campaign Scope *
            </label>
            <div className="flex space-x-6">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="global"
                  checked={watchScope === 'global'}
                  onChange={() => handleScopeChange('global')}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-gray-700">Global</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  value="municipality"
                  checked={watchScope === 'municipality'}
                  onChange={() => handleScopeChange('municipality')}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-gray-700">Municipality</span>
              </label>
            </div>
            {errors.scope && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                {errors.scope.message}
              </p>
            )}
          </div>

          {/* Municipality Selection (conditional) */}
          {watchScope === 'municipality' && (
            <div className="mb-6">
              <label htmlFor="municipalityId" className="block text-sm font-medium text-gray-700 mb-2">
                Select Municipality *
              </label>
              <select
                {...register('municipalityId')}
                id="municipalityId"
                name="municipalityId"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.municipalityId ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  setValue('municipalityId', e.target.value);
                  trigger('municipalityId');
                }}
              >
                <option value="">Select a municipality</option>
                {municipalities.map(municipality => (
                  <option key={municipality._id} value={municipality._id}>
                    {municipality.name}
                  </option>
                ))}
              </select>
              {errors.municipalityId && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.municipalityId.message}
                </p>
              )}
            </div>
          )}

          {/* Campaign Period */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </label>
              <input
                {...register('startDate')}
                type="date"
                id="startDate"
                name="startDate"
                min={today}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.startDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  setValue('startDate', e.target.value);
                  trigger('startDate');
                }}
              />
              {errors.startDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.startDate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </label>
              <input
                {...register('endDate')}
                type="date"
                id="endDate"
                name="endDate"
                min={minEndDate}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
                  errors.endDate ? 'border-red-500 bg-red-50' : 'border-gray-300'
                }`}
                onChange={(e) => {
                  setValue('endDate', e.target.value);
                  trigger('endDate');
                }}
              />
              {errors.endDate && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.endDate.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            onClick={() => navigate('/sponsors')} // Adjust the route as needed
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (!isEditing && !bannerImage)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : isEditing ? 'Update Sponsor' : 'Create Sponsor'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SponsorForm;