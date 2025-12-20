import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Shield,
  Check,
  MapPin,
  Home,
  Globe,
  Building,
  ChevronDown,
  Search,
  Map,
  Users
} from "lucide-react";
import toast from "react-hot-toast";
import { useRegisterMutation } from "../../../store/api/authApi";
import { ROUTES } from "../../../utils/constants/routes";
import {
  TextInput,
  PasswordInput,
  FileUpload,
  TextAreaInput,
  LocationInput,
} from "../../../components/shared/Form/FormComponents";
import AuthLayout from "../../../components/templates/AuthLayout/AuthLayout";
import { useGetAllMunicipalitiesQuery } from "../../../store/api/Municipality";

// Validation Schema
const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name cannot exceed 50 characters"),
    email: z.string().email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(
        /^9[7-8]\d{8}$/,
        "Please enter a valid Nepali number (98/97XXXXXXXX)"
      ),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string(),
    address: z.string().min(5, "Address must be at least 5 characters"),
    ward: z
      .string()
      .min(1, "Please enter ward number")
      .regex(/^\d+$/, "Ward number must be numeric"),
    municipalityId: z.string().optional(),
    municipalityName: z.string().optional(), // For display
    profileImage: z.any().optional(),
    location: z
      .object({
        latitude: z.number({
          required_error: "Location is required. Please select your location on the map.",
          invalid_type_error: "Latitude must be a number"
        }).min(-90).max(90),
        longitude: z.number({
          required_error: "Location is required. Please select your location on the map.",
          invalid_type_error: "Longitude must be a number"
        }).min(-180).max(180),
        address: z.string().optional()
      })
      .nullable() 
      .refine((data) => data !== null && data.latitude && data.longitude, {
        message: "Please select your location on the map",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const RegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [register, { isLoading }] = useRegisterMutation();
  const [searchQuery, setSearchQuery] = useState("");
  const [showMunicipalityDropdown, setShowMunicipalityDropdown] = useState(false);

  // Fetch municipalities
  const { 
    data: municipalityResponse, 
    isLoading: isLoadingMunicipalities,
    isError: isErrorMunicipalities 
  } = useGetAllMunicipalitiesQuery();

  const municipalities = municipalityResponse?.data || [];
  const totalMunicipalities = municipalityResponse?.pagination?.total || 0;

  const {
    control,
    handleSubmit,
    watch,
    trigger,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      municipalityId: "",
      municipalityName: "",
      location: null,
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      address: "",
      ward: "",
      profileImage: undefined,
    },
    mode: "onChange",
  });

  const selectedMunicipalityId = watch("municipalityId");
  const selectedMunicipalityName = watch("municipalityName");
  const locationData = watch("location");
  const allValues = watch();

  // Filter municipalities based on search
  const filteredMunicipalities = municipalities.filter(muni =>
    muni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    muni.location?.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected municipality details
  const selectedMunicipality = municipalities.find(
    muni => muni._id === selectedMunicipalityId
  );

  // Set default municipality if only one exists
  useEffect(() => {
    if (municipalities.length === 1 && !selectedMunicipalityId) {
      const muni = municipalities[0];
      setValue("municipalityId", muni._id);
      setValue("municipalityName", muni.name);
    }
  }, [municipalities, selectedMunicipalityId, setValue]);

  const steps = [
    { number: 1, title: "Personal", subtitle: "Basic information", icon: "👤" },
    { number: 2, title: "Security", subtitle: "Account security", icon: "🔒" },
    { number: 3, title: "Location", subtitle: "Your address", icon: "📍" },
  ];

  const nextStep = async () => {
    const fields = {
      1: ["name", "email", "phone"],
      2: ["password", "confirmPassword"],
      3: ["address", "ward", "location"],
    };

    const isValid = await trigger(fields[step]);
    if (isValid) {
      setStep((prev) => Math.min(prev + 1, 3));
    } else {
      toast.error(`Please fill all required fields correctly in ${steps[step-1]?.title || 'this'} step`);
    }
  };

  const prevStep = () => {
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleMunicipalitySelect = (municipality) => {
    setValue("municipalityId", municipality._id);
    setValue("municipalityName", municipality.name);
    setShowMunicipalityDropdown(false);
    setSearchQuery("");
    
    // Optional: Auto-fill location if municipality has coordinates
    if (municipality.location?.coordinates) {
      const { lat, lng } = municipality.location.coordinates;
      setValue("location", {
        latitude: lat,
        longitude: lng,
        address: `${municipality.name}, ${municipality.location?.city || ''}`
      });
    }
  };

  const handleClearMunicipality = () => {
    setValue("municipalityId", "");
    setValue("municipalityName", "");
  };

  const onSubmit = async (data) => {
    const isValid = await trigger();
    if (!isValid) {
      toast.error("Please fill all required fields correctly.");
      return;
    }

    try {
      const formData = new FormData();

      Object.keys(data).forEach((key) => {
        if (key !== "confirmPassword" && key !== "municipalityName") {
          const value = data[key];
          if (value !== undefined && value !== null && value !== "") {
            if (key === "location" && value) {
              formData.append(key, JSON.stringify(value));
            } else if (key === "profileImage" && value instanceof File) {
              formData.append(key, value);
            } else if (typeof value === "string" || typeof value === "number") {
              formData.append(key, value.toString());
            }
          }
        }
      });

      formData.append("role", "citizen");

      const result = await register(formData).unwrap();
      localStorage.setItem("pending_activation_email", data.email);
      
      toast.success(
        <div className="flex flex-col">
          <span className="font-semibold">✅ Registration Successful!</span>
          <span className="text-sm">Check your email for activation code</span>
        </div>
      );

      navigate(ROUTES.ACTIVATE_ACCOUNT, {
        replace: true,
        state: { email: data.email }
      });

    } catch (error) {
      console.error("Registration error:", error);
      if (error.data?.errors) {
        error.data.errors.forEach((err) => {
          if (err.path) {
            toast.error(`${err.path}: ${err.msg}`);
          }
        });
      } else {
        toast.error(
          error.data?.message || "Registration failed. Please try again."
        );
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <FileUpload
              control={control}
              name="profileImage"
              label="Profile Picture (Optional)"
              accept="image/*"
              animationDelay={0}
              description="Max file size: 5MB • PNG, JPG, JPEG"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TextInput
                control={control}
                name="name"
                label="Full Name"
                placeholder="Enter your full name"
                required
                icon="user"
                animationDelay={1}
                error={errors.name}
              />

              <TextInput
                control={control}
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                icon="mail"
                animationDelay={2}
                error={errors.email}
              />

              <TextInput
                control={control}
                name="phone"
                label="Phone Number"
                placeholder="98XXXXXXXX"
                required
                icon="phone"
                validation={{
                  pattern: {
                    value: /^9[7-8]\d{8}$/,
                    message: "Invalid Nepali number (98/97XXXXXXXX)",
                  },
                }}
                animationDelay={3}
                error={errors.phone}
              />
            </div>

            {/* Citizen Benefits Info */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-r from-primary-50 to-primary-100 border border-primary-200 rounded-xl p-5"
            >
              <div className="flex items-start">
                <div className="bg-primary-500 text-white p-2 rounded-lg mr-4">
                  <Users size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-primary-900 mb-1">
                    Citizen Account Benefits
                  </h4>
                  <ul className="text-sm text-primary-800 space-y-1">
                    <li className="flex items-center">
                      <Check size={14} className="mr-2 text-primary-600" />
                      Report civic issues with photos & location
                    </li>
                    <li className="flex items-center">
                      <Check size={14} className="mr-2 text-primary-600" />
                      Track issue resolution in real-time
                    </li>
                    <li className="flex items-center">
                      <Check size={14} className="mr-2 text-primary-600" />
                      Earn reward points for contributions
                    </li>
                    <li className="flex items-center">
                      <Check size={14} className="mr-2 text-primary-600" />
                      Get notified about local community updates
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          </motion.div>
        );

      case 2:
        const password = watch("password");
        const passwordRequirements = [
          { text: "At least 6 characters", check: password?.length >= 6 },
          { text: "One uppercase letter", check: /[A-Z]/.test(password) },
          { text: "One lowercase letter", check: /[a-z]/.test(password) },
          { text: "One number", check: /\d/.test(password) },
          {
            text: "One special character (optional)",
            check: /[^A-Za-z0-9]/.test(password),
          },
        ];

        return (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <PasswordInput
              control={control}
              name="password"
              label="Create Password"
              placeholder="Enter a strong password"
              required
              showStrength
              animationDelay={0}
              error={errors.password}
            />

            <PasswordInput
              control={control}
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter your password"
              required
              animationDelay={1}
              error={errors.confirmPassword}
            />

            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center mb-4">
                <div className="p-2 bg-primary-100 rounded-lg mr-3">
                  <Shield className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">
                    Password Requirements
                  </h4>
                  <p className="text-xs text-gray-500">
                    Follow these guidelines for a secure password
                  </p>
                </div>
              </div>

              <ul className="space-y-3">
                {passwordRequirements.map((req, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center"
                  >
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
                        req.check
                          ? "bg-green-100 border border-green-200"
                          : "bg-gray-50 border border-gray-200"
                      }`}
                    >
                      <Check
                        className={`w-3 h-3 ${
                          req.check ? "text-green-600" : "text-gray-400"
                        }`}
                      />
                    </div>
                    <span
                      className={`text-sm ${
                        req.check ? "text-gray-800" : "text-gray-500"
                      }`}
                    >
                      {req.text}
                    </span>
                  </motion.li>
                ))}
              </ul>
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
            className="space-y-6"
          >
            <TextAreaInput
              control={control}
              name="address"
              label="Full Address"
              placeholder="Enter your complete street address, area, and city"
              required
              rows={3}
              animationDelay={0}
              error={errors.address}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <TextInput
                  control={control}
                  name="ward"
                  label="Ward Number *"
                  placeholder="e.g., 5"
                  required
                  icon="mapPin"
                  animationDelay={1}
                  validation={{
                    pattern: {
                      value: /^\d+$/,
                      message: "Please enter a valid ward number",
                    },
                  }}
                  error={errors.ward}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Enter the ward number of your locality
                </p>
              </div>

              {/* Municipality Dropdown */}
              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Municipality *
                </label>
                
                <Controller
                  name="municipalityId"
                  control={control}
                  render={({ field }) => (
                    <div className="relative">
                      {/* Selected Municipality Display */}
                      <button
                        type="button"
                        onClick={() => setShowMunicipalityDropdown(!showMunicipalityDropdown)}
                        className={`w-full flex items-center justify-between px-4 py-3.5 border rounded-xl text-left transition-all duration-200 ${
                          selectedMunicipalityName
                            ? "border-primary-300 bg-primary-50"
                            : "border-gray-300 hover:border-gray-400"
                        } ${errors.municipalityId ? "border-red-500" : ""}`}
                      >
                        <div className="flex items-center">
                          <Building className="w-5 h-5 text-gray-500 mr-3" />
                          <div className="flex-1">
                            {selectedMunicipalityName ? (
                              <>
                                <div className="font-medium text-gray-900">
                                  {selectedMunicipalityName}
                                </div>
                                {selectedMunicipality && (
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {selectedMunicipality.location?.city} • {selectedMunicipality.contactPhone}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-gray-500">
                                Select your municipality
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedMunicipalityName && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleClearMunicipality();
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full"
                            >
                              <ChevronDown className="w-4 h-4 text-gray-400 rotate-90" />
                            </button>
                          )}
                          <ChevronDown 
                            className={`w-5 h-5 text-gray-400 transition-transform ${
                              showMunicipalityDropdown ? "rotate-180" : ""
                            }`}
                          />
                        </div>
                      </button>

                      {/* Dropdown Menu */}
                      {showMunicipalityDropdown && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-80 overflow-hidden">
                          {/* Search Bar */}
                          <div className="p-3 border-b border-gray-100">
                            <div className="relative">
                              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                              <input
                                type="text"
                                placeholder="Search municipalities..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                              />
                            </div>
                          </div>

                          {/* Municipality List */}
                          <div className="overflow-y-auto max-h-64">
                            {isLoadingMunicipalities ? (
                              <div className="p-4 text-center">
                                <Loader2 className="w-5 h-5 animate-spin mx-auto text-gray-400" />
                                <p className="text-sm text-gray-500 mt-2">Loading municipalities...</p>
                              </div>
                            ) : isErrorMunicipalities ? (
                              <div className="p-4 text-center text-red-500">
                                Failed to load municipalities
                              </div>
                            ) : filteredMunicipalities.length === 0 ? (
                              <div className="p-4 text-center text-gray-500">
                                No municipalities found
                              </div>
                            ) : (
                              <>
                                {/* Recently Selected (if any) */}
                                {selectedMunicipality && (
                                  <div className="p-2">
                                    <div className="text-xs font-medium text-gray-500 px-3 py-1">
                                      Currently Selected
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleMunicipalitySelect(selectedMunicipality)}
                                      className="w-full flex items-center p-3 hover:bg-primary-50 rounded-lg border border-primary-200 bg-primary-25"
                                    >
                                      <div className="flex-1 text-left">
                                        <div className="font-medium text-primary-700">
                                          {selectedMunicipality.name}
                                        </div>
                                        <div className="text-xs text-primary-600 mt-0.5">
                                          {selectedMunicipality.location?.city} • Active
                                        </div>
                                      </div>
                                      <CheckCircle className="w-5 h-5 text-primary-600" />
                                    </button>
                                  </div>
                                )}

                                {/* All Municipalities */}
                                <div className="p-2">
                                  <div className="text-xs font-medium text-gray-500 px-3 py-1">
                                    Available Municipalities ({totalMunicipalities})
                                  </div>
                                  {filteredMunicipalities
                                    .filter(muni => muni._id !== selectedMunicipalityId)
                                    .map((municipality) => (
                                      <button
                                        key={municipality._id}
                                        type="button"
                                        onClick={() => handleMunicipalitySelect(municipality)}
                                        className="w-full flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors border-b border-gray-100 last:border-0"
                                      >
                                        <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-50 rounded-lg flex items-center justify-center mr-3">
                                          <Building className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div className="flex-1 text-left">
                                          <div className="font-medium text-gray-900">
                                            {municipality.name}
                                          </div>
                                          <div className="text-xs text-gray-500 mt-1">
                                            <div className="flex items-center">
                                              <MapPin className="w-3 h-3 mr-1" />
                                              {municipality.location?.city || "N/A"}
                                            </div>
                                            <div className="flex items-center mt-1">
                                              <Home className="w-3 h-3 mr-1" />
                                              Contact: {municipality.contactPhone || "N/A"}
                                            </div>
                                          </div>
                                          {municipality.settings?.citizenRewards && (
                                            <div className="mt-2">
                                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Citizen Rewards Active
                                              </span>
                                            </div>
                                          )}
                                        </div>
                                      </button>
                                    ))
                                  }
                                </div>
                              </>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="p-3 border-t border-gray-100 bg-gray-50">
                            <p className="text-xs text-gray-500 text-center">
                              Select your local municipality for better service
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                />
                {errors.municipalityId && (
                  <p className="mt-1 text-sm text-red-600">{errors.municipalityId.message}</p>
                )}
                {selectedMunicipality && (
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center text-sm text-gray-600">
                      <Map className="w-4 h-4 mr-2 text-blue-500" />
                      <span>Location: {selectedMunicipality.location?.city || "N/A"}</span>
                    </div>
                    {selectedMunicipality.settings && (
                      <div className="flex items-center text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                        <span>Point Value: {selectedMunicipality.settings.pointValue || 5} points per report</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Location Input Component */}
            <LocationInput
              control={control}
              name="location"
              label="Your Location Coordinates"
              required={true}
              animationDelay={3}
              error={errors.location}
            />

            {/* Location Preview Card */}
            {locationData && locationData.latitude && locationData.longitude && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5"
              >
                <div className="flex items-start">
                  <div className="bg-green-100 p-3 rounded-xl mr-4">
                    <Globe className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-green-900 text-lg">
                          Location Verified
                        </h4>
                        <p className="text-sm text-green-700">
                          Your location will be saved for accurate service delivery
                        </p>
                      </div>
                      <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                        <CheckCircle size={14} className="mr-1" />
                        Ready
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">N</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Latitude</p>
                            <p className="font-mono text-lg font-bold text-gray-800">
                              {locationData.latitude?.toFixed(6)}°
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex items-center mb-2">
                          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <span className="text-orange-600 font-semibold">E</span>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Longitude</p>
                            <p className="font-mono text-lg font-bold text-gray-800">
                              {locationData.longitude?.toFixed(6)}°
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {locationData.address && (
                      <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
                        <div className="flex items-start mb-2">
                          <MapPin size={16} className="text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                          <div>
                            <p className="text-xs text-gray-500 mb-1">Detected Address</p>
                            <p className="text-gray-800 leading-relaxed">
                              {locationData.address}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
    }
  };

  return (
    <AuthLayout
      title="Join NagarAlert"
      subtitle="Become a proactive citizen"
      backLink={ROUTES.LOGIN}
      backText="Already have an account? Sign in"
      showIllustration={false}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full"
      >
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            {steps.map((s, index) => (
              <React.Fragment key={s.number}>
                <div className="flex flex-col items-center relative z-10">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center border-2 relative
                      ${
                        step >= s.number
                          ? "bg-gradient-to-br from-primary-500 to-primary-600 border-primary-500 text-white shadow-lg shadow-primary-200"
                          : "border-gray-200 bg-white text-gray-400"
                      }
                      transition-all duration-300 cursor-default
                    `}
                  >
                    {step > s.number ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <>
                        <span className="text-xl">{s.icon}</span>
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-primary-500 text-white text-xs rounded-full flex items-center justify-center border-2 border-white">
                          {s.number}
                        </span>
                      </>
                    )}
                  </motion.div>
                  <div className="mt-4 text-center">
                    <p
                      className={`text-sm font-semibold ${
                        step >= s.number ? "text-gray-900" : "text-gray-500"
                      }`}
                    >
                      {s.title}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{s.subtitle}</p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div className="flex-1 mx-4 h-0.5 relative">
                    <div className="absolute inset-0 bg-gray-200 rounded-full"></div>
                    <motion.div
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: step > s.number ? 1 : 0 }}
                      className="absolute inset-0 bg-gradient-to-r from-primary-500 to-primary-400 rounded-full origin-left"
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          <AnimatePresence mode="wait">{renderStep()}</AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-100">
            <div>
              {step > 1 && (
                <motion.button
                  type="button"
                  onClick={prevStep}
                  disabled={isLoading}
                  whileHover={{ x: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-5 py-3 text-gray-700 hover:text-gray-900 
                           hover:bg-gray-100 rounded-xl transition-all duration-200 disabled:opacity-50 border border-gray-200"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </motion.button>
              )}
            </div>

            <div className="flex items-center space-x-4">
              {step < 3 ? (
                <motion.button
                  type="button"
                  onClick={nextStep}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-7 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 
                           text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-300 
                           transition-all duration-200 shadow-md"
                >
                  Continue to {steps[step]?.title || "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </motion.button>
              ) : (
                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center px-8 py-3.5 bg-gradient-to-r from-primary-500 to-primary-600 
                           text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-primary-300 
                           transition-all duration-200 shadow-md disabled:opacity-50 disabled:cursor-not-allowed
                           relative overflow-hidden group"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-primary-600 to-primary-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    initial={false}
                  />

                  <span className="relative z-10 flex items-center">
                    {isLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin mr-2" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Create Account
                      </>
                    )}
                  </span>
                </motion.button>
              )}
            </div>
          </div>

          {/* Terms & Privacy */}
          <div className="pt-6 mt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              By registering, you agree to our{" "}
              <Link
                to="/terms"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                to="/privacy"
                className="text-primary-600 hover:text-primary-700 hover:underline font-medium"
              >
                Privacy Policy
              </Link>
              . Your data is secure and protected.
            </p>

            {/* Security Assurance */}
            <div className="mt-4 flex items-center justify-center space-x-6 text-xs text-gray-400">
              <div className="flex items-center">
                <Shield className="w-3 h-3 mr-1" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center">
                <CheckCircle className="w-3 h-3 mr-1" />
                <span>GDPR Compliant</span>
              </div>
              <div className="flex items-center">
                <Globe className="w-3 h-3 mr-1" />
                <span>Location Secured</span>
              </div>
            </div>
          </div>
        </form>
      </motion.div>
    </AuthLayout>
  );
};

export default RegisterPage;