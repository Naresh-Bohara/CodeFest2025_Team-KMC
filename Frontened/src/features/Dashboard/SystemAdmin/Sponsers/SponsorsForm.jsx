import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  useCreateSponsorMutation,
  useUpdateSponsorMutation,
} from '../../../../store/api/sponsors';

// Validation schema
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
        'public_awareness',
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

  municipalityId: yup.string().when('scope', {
    is: 'municipality',
    then: (schema) =>
      schema
        .matches(/^[0-9a-fA-F]{24}$/, 'Invalid municipality ID')
        .required('Municipality is required for municipal scope'),
    otherwise: (schema) => schema.nullable(),
  }),

  startDate: yup
    .date()
    .typeError('Start date must be a valid date')
    .min(new Date(), 'Start date must be in the future')
    .required('Start date is required'),

  endDate: yup
    .date()
    .typeError('End date must be a valid date')
    .min(yup.ref('startDate'), 'End date must be after start date')
    .required('End date is required'),
});

// Sponsor type options
const SPONSOR_TYPE_OPTIONS = [
  { value: 'local_business', label: 'Local Business' },
  { value: 'corporate', label: 'Corporate' },
  { value: 'ngo', label: 'NGO' },
  { value: 'community_event', label: 'Community Event' },
  { value: 'music_program', label: 'Music Program' },
  { value: 'party_event', label: 'Party Event' },
  { value: 'csr_campaign', label: 'CSR Campaign' },
  { value: 'government_scheme', label: 'Government Scheme' },
  { value: 'public_awareness', label: 'Public Awareness' },
];

// Scope options
const SCOPE_OPTIONS = [
  { value: 'global', label: 'Global' },
  { value: 'municipality', label: 'Municipality' },
];

const SponsorForm = ({
  sponsorId = null,
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
  const today = new Date().toISOString().split('T')[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
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
      endDate: '',
    },
    mode: 'onChange',
  });

  const watchScope = watch('scope', 'global');
  const watchStartDate = watch('startDate');
  const watchDescription = watch('description', '');

  // Handle image upload
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
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError('Image size must be less than 5MB');
      return;
    }

    setBannerImage(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  // Handle form submission
  const onSubmitForm = async (data) => {
    try {
      // Validate banner image for new sponsors
      if (!isEditing && !bannerImage) {
        setFileError('Banner image is required');
        toast.error('Please upload a banner image');
        return;
      }

      const formData = new FormData();

      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value != null && value !== '') {
          // Handle dates
          if (key === 'startDate' || key === 'endDate') {
            formData.append(key, new Date(value).toISOString());
          } else if (key === 'municipalityId' && data.scope === 'global') {
            // Skip municipalityId for global scope
          } else {
            formData.append(key, String(value));
          }
        }
      });

      // Append image if exists
      if (bannerImage) {
        formData.append('bannerImage', bannerImage);
      }

      console.log('Submitting sponsor...');

      if (isEditing) {
        // For update, append the ID to formData
        const updateFormData = new FormData();
        updateFormData.append('id', sponsorId);
        for (let [key, value] of formData.entries()) {
          updateFormData.append(key, value);
        }

        await updateSponsor(updateFormData).unwrap();
        toast.success('Sponsor updated successfully!');
      } else {
        await createSponsor(formData).unwrap();
        toast.success('Sponsor created successfully!');
      }

      // Navigate back after success
      setTimeout(() => navigate('/sponsors'), 1500);
    } catch (error) {
      console.error('Form submission error:', error);
      const errorMessage =
        error?.data?.message || 'Failed to save sponsor. Please try again.';
      toast.error(errorMessage);
    }
  };

  // Calculate minimum end date (start date + 1 day)
  const getMinEndDate = () => {
    if (!watchStartDate) return today;
    const nextDay = new Date(watchStartDate);
    nextDay.setDate(nextDay.getDate() + 1);
    return nextDay.toISOString().split('T')[0];
  };

  const minEndDate = getMinEndDate();

  // Form field configuration
  const formSections = [
    {
      title: 'Banner Image',
      icon: '📌',
      required: !isEditing,
      description: `Upload a banner image for the sponsor campaign ${!isEditing ? '(required)' : ''}`,
      fields: [
        {
          type: 'file',
          name: 'bannerImage',
          accept: 'image/*',
          onChange: handleImageUpload,
          preview: imagePreview,
          fileError,
          bannerImage,
        },
      ],
    },
    {
      title: 'Sponsor Information',
      icon: '🏢',
      fields: [
        {
          label: 'Sponsor Name',
          name: 'name',
          type: 'text',
          placeholder: 'Company/Organization name',
          required: true,
          className: 'md:col-span-2',
        },
        {
          label: 'Contact Email',
          name: 'contactEmail',
          type: 'email',
          placeholder: 'contact@company.com',
          required: true,
        },
        {
          label: 'Website',
          name: 'website',
          type: 'url',
          placeholder: 'https://www.example.com',
          required: false,
        },
        {
          label: 'Sponsor Type',
          name: 'sponsorType',
          type: 'select',
          options: SPONSOR_TYPE_OPTIONS,
          required: true,
        },
        {
          label: 'Contact Phone',
          name: 'contactPhone',
          type: 'tel',
          placeholder: '+977-98XXXXXXXX',
          required: true,
          helperText: 'Format: +977-98XXXXXXXX or 97XXXXXXXX',
        },
      ],
    },
    {
      title: 'Campaign Details',
      icon: '📋',
      fields: [
        {
          label: 'Campaign Title',
          name: 'title',
          type: 'text',
          placeholder: 'Enter campaign title',
          required: true,
          className: 'md:col-span-2',
        },
        {
          label: 'Description',
          name: 'description',
          type: 'textarea',
          placeholder: 'Enter campaign description (max 500 characters)',
          required: false,
          maxLength: 500,
          characterCount: watchDescription.length,
          className: 'md:col-span-2',
        },
        {
          label: 'Campaign Scope',
          name: 'scope',
          type: 'radio-group',
          options: SCOPE_OPTIONS,
          required: true,
          onChange: (value) => {
            setValue('scope', value, { shouldValidate: true });
            if (value === 'global') {
              setValue('municipalityId', '', { shouldValidate: true });
            }
          },
          currentValue: watchScope,
          className: 'md:col-span-2',
        },
        ...(watchScope === 'municipality'
          ? [
              {
                label: 'Select Municipality',
                name: 'municipalityId',
                type: 'select',
                options: municipalities.map((m) => ({
                  value: m._id,
                  label: m.name,
                })),
                required: true,
                className: 'md:col-span-2',
              },
            ]
          : []),
        {
          label: 'Start Date',
          name: 'startDate',
          type: 'date',
          required: true,
          min: today,
        },
        {
          label: 'End Date',
          name: 'endDate',
          type: 'date',
          required: true,
          min: minEndDate,
        },
      ],
    },
  ];

  // Error message component
  const ErrorMessage = ({ message }) => (
    <p className="mt-1 text-sm text-red-600 flex items-center">
      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );

  // Form input components
  const renderInput = (field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      className: `w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${
        errors[field.name] ? 'border-red-500 bg-red-50' : 'border-gray-300'
      } ${field.className || ''}`,
      ...register(field.name),
      onBlur: () => trigger(field.name),
    };

    switch (field.type) {
      case 'select':
        return (
          <select
            {...commonProps}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              trigger(field.name);
            }}
          >
            <option value="">Select {field.label}</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'textarea':
        return (
          <textarea
            {...commonProps}
            rows={4}
            placeholder={field.placeholder}
            maxLength={field.maxLength}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              trigger(field.name);
            }}
          />
        );

      case 'radio-group':
        return (
          <div className="flex space-x-6">
            {field.options?.map((option) => (
              <label key={option.value} className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  name={field.name}
                  value={option.value}
                  checked={field.currentValue === option.value}
                  onChange={() => field.onChange(option.value)}
                  className="h-5 w-5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                />
                <span className="ml-3 text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );

      default:
        return (
          <input
            {...commonProps}
            type={field.type}
            placeholder={field.placeholder}
            min={field.min}
            onChange={(e) => {
              setValue(field.name, e.target.value);
              trigger(field.name);
            }}
          />
        );
    }
  };

  // Render file upload section
  const renderFileUpload = (field) => (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors">
      {field.preview ? (
        <div className="mb-4">
          <img
            src={field.preview}
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
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
            />
          </svg>
          Choose File
        </span>
        <input
          type="file"
          accept={field.accept}
          onChange={field.onChange}
          className="hidden"
          id={field.name}
          name={field.name}
        />
      </label>
      <p className="mt-2 text-sm text-gray-500">
        {field.bannerImage ? field.bannerImage.name : 'No file chosen'}
      </p>
      {field.fileError && <p className="mt-2 text-sm text-red-600">{field.fileError}</p>}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6">
      <h1 className="text-2xl font-bold mb-2 text-gray-800">
        {isEditing ? 'Edit Sponsor' : 'Add New Sponsor'}
      </h1>
      <p className="text-gray-600 mb-8">
        {isEditing ? 'Update sponsor campaign details' : 'Create a new advertising campaign or sponsor entry'}
      </p>

      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-8" noValidate>
        {formSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="bg-gray-50 p-6 rounded-lg">
            <div className="flex items-center mb-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-blue-600">{section.icon}</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                {section.title} {section.required && '*'}
              </h2>
            </div>

            {section.description && (
              <p className="text-gray-600 mb-4">{section.description}</p>
            )}

            {section.fields[0].type === 'file' ? (
              renderFileUpload(section.fields[0])
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {section.fields.map((field, fieldIndex) => (
                  <div key={fieldIndex} className={field.className}>
                    <label
                      htmlFor={field.name}
                      className="block text-sm font-medium text-gray-700 mb-2"
                    >
                      {field.label} {field.required && '*'}
                    </label>
                    {renderInput(field)}
                    {field.helperText && (
                      <p className="mt-1 text-xs text-gray-500">{field.helperText}</p>
                    )}
                    {errors[field.name] && <ErrorMessage message={errors[field.name]?.message} />}
                    {field.type === 'textarea' && (
                      <div className="flex justify-end mt-1">
                        <p className="text-xs text-gray-500">
                          {field.characterCount}/{field.maxLength} characters
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4 pt-6 border-t">
          <button
            type="button"
            className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
            onClick={() => navigate('/sponsors')}
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
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                {isEditing ? 'Updating...' : 'Creating...'}
              </span>
            ) : (
              `${isEditing ? 'Update' : 'Create'} Sponsor`
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default SponsorForm;