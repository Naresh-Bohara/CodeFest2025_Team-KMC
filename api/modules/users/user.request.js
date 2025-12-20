import Joi from "joi";

// User Create DTO
const userCreateDTO = Joi.object({
  name: Joi.string().min(2).max(50).required().messages({
    "string.empty": "Name is required",
    "string.min": "Name must be at least 2 characters",
    "string.max": "Name cannot exceed 50 characters"
  }),

  email: Joi.string().email().required().messages({
    "string.empty": "Email is required",
    "string.email": "Invalid email format"
  }),

  password: Joi.string().min(6).required().messages({
    "string.empty": "Password is required",
    "string.min": "Password must be at least 6 characters"
  }),

  role: Joi.string()
    .valid("citizen", "municipality_admin", "field_staff", "sponsor", "sys_admin")
    .required()
    .messages({
      "any.only": "Invalid role",
      "any.required": "Role is required"
    }),

  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .when('role', {
      is: Joi.string().valid('citizen', 'municipality_admin', 'field_staff'),
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      "string.pattern.base": "Invalid municipality ID"
    }),

  phone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .required()
    .messages({
      "string.empty": "Phone is required",
      "string.pattern.base": "Invalid Nepali phone number"
    }),

  address: Joi.string().when('role', {
    is: 'citizen',
    then: Joi.string().min(5).required(),
    otherwise: Joi.string().optional()
  }).messages({
    "string.empty": "Address is required for citizens",
    "string.min": "Address must be at least 5 characters"
  }),

  ward: Joi.string()
    .pattern(/^\d+$/)
    .when('role', {
      is: 'citizen',
      then: Joi.required(),
      otherwise: Joi.optional()
    })
    .messages({
      "string.empty": "Ward is required for citizens",
      "string.pattern.base": "Ward must be a number"
    }),

  status: Joi.string()
    .valid("active", "pending", "inactive", "suspended")
    .default("active")
    .messages({
      "any.only": "Invalid status"
    }),

  // Location for citizen
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    address: Joi.string().optional()
  }).optional(),

  // Staff specific fields
  department: Joi.string().when('role', {
    is: 'field_staff',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),

  designation: Joi.string().when('role', {
    is: Joi.string().valid('field_staff', 'municipality_admin'),
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),

  // Sponsor specific fields
  companyName: Joi.string().when('role', {
    is: 'sponsor',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),

  companyAddress: Joi.string().when('role', {
    is: 'sponsor',
    then: Joi.string().required(),
    otherwise: Joi.string().optional()
  }),

  points: Joi.number().min(0).default(0)
});

// User Update DTO
const userUpdateDTO = Joi.object({
  name: Joi.string().min(2).max(50).optional(),
  phone: Joi.string()
    .pattern(/^(\+977-?)?(98|97)\d{8}$/)
    .optional()
    .messages({
      "string.pattern.base": "Invalid Nepali phone number"
    }),
  address: Joi.string().min(5).optional(),
  ward: Joi.string()
    .pattern(/^\d+$/)
    .optional(),
  status: Joi.string()
    .valid("active", "pending", "inactive", "suspended")
    .optional(),
  department: Joi.string().optional(),
  designation: Joi.string().optional(),
  companyName: Joi.string().optional(),
  companyAddress: Joi.string().optional(),
  points: Joi.number().min(0).optional(),
  location: Joi.object({
    latitude: Joi.number().min(-90).max(90),
    longitude: Joi.number().min(-180).max(180),
    address: Joi.string().optional()
  }).optional()
});

// User Filter DTO
const userFilterDTO = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(10),
  search: Joi.string().optional(),
  role: Joi.string()
    .valid("citizen", "municipality_admin", "field_staff", "sponsor", "sys_admin")
    .optional(),
  status: Joi.string()
    .valid("active", "pending", "inactive", "suspended")
    .optional(),
  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional(),
  sortBy: Joi.string()
    .valid("name", "createdAt", "points", "lastLogin")
    .default("createdAt"),
  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc")
});

// User ID DTO
const userIdDTO = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      "string.pattern.base": "Invalid user ID"
    })
});

// User Statistics DTO
const userStatsDTO = Joi.object({
  period: Joi.string()
    .valid("today", "week", "month", "quarter", "year", "all")
    .default("all"),
  municipalityId: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .optional()
});

export { 
  userCreateDTO, 
  userUpdateDTO, 
  userFilterDTO,
  userIdDTO,
  userStatsDTO 
};