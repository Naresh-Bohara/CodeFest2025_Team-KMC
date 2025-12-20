import bcrypt from "bcryptjs";
import UserModel from "./user.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import HttpResponse from "../../constants/response-status.contants.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import { generateRandomString, generateDateTime } from "../../utilities/helpers.js";

class UserService {
  // Get all users with filtering
  getAllUsers = async (filter = {}) => {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status,
      municipalityId,
      sortBy = "createdAt",
      sortOrder = "desc"
    } = filter;

    const query = {};

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by role
    if (role) query.role = role;

    // Filter by status
    if (status) query.status = status;

    // Filter by municipality
    if (municipalityId) query.municipalityId = municipalityId;

    // Exclude system admin from regular lists
    query.role = { $ne: "sys_admin" };

    const skip = (page - 1) * limit;
    const sort = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .populate("municipalityId", "name location.city")
        .select("-password -activationToken -resetToken -tokenExpiry")
        .sort(sort)
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  // Get user by ID
  getUserById = async (userId) => {
    const user = await UserModel.findById(userId)
      .populate("municipalityId", "name location.city contactEmail contactPhone")
      .select("-password -activationToken -resetToken -tokenExpiry");

    if (!user) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    return user;
  };

  // Create user (by system admin)
  createUser = async (userData, file) => {
    try {
      // Check if email already exists
      const existingUser = await UserModel.findOne({ email: userData.email });
      if (existingUser) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Email already registered",
          statusCode: HttpResponse.validationFailed
        };
      }

      // Validate municipality for citizen/staff roles
      if (["citizen", "municipality_admin", "field_staff"].includes(userData.role)) {
        if (!userData.municipalityId) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Municipality is required for this role",
            statusCode: HttpResponse.validationFailed
          };
        }

        const municipality = await MunicipalityModel.findById(userData.municipalityId);
        if (!municipality) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Municipality not found",
            statusCode: HttpResponse.validationFailed
          };
        }
      }

      // Handle file upload
      if (file) {
        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!allowedTypes.includes(file.mimetype)) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Invalid image format",
            statusCode: HttpResponse.validationFailed
          };
        }

        if (file.size > 5 * 1024 * 1024) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Image too large",
            statusCode: HttpResponse.validationFailed
          };
        }

        const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/users');
        userData.profileImage = uploadResult.url;
      }

      // Hash password
      userData.password = bcrypt.hashSync(userData.password, 12);

      // Set status to active for admin-created users
      userData.status = userData.status || "active";

      // Generate activation token for email verification
      if (userData.role === "citizen") {
        userData.activationToken = generateRandomString(6).toUpperCase();
        userData.tokenExpiry = generateDateTime(1440); // 24 hours for admin-created users
      }

      // Create role-specific profile
      if (userData.role === "citizen") {
        userData.citizenProfile = {
          address: userData.address,
          ward: userData.ward,
          location: userData.location ? {
            type: "Point",
            coordinates: [userData.location.longitude, userData.location.latitude],
            address: userData.location.address || ""
          } : null,
          registrationDate: new Date()
        };
      } else if (userData.role === "field_staff") {
        userData.staffProfile = {
          department: userData.department,
          designation: userData.designation,
          hireDate: new Date()
        };
      } else if (userData.role === "sponsor") {
        userData.sponsorProfile = {
          companyName: userData.companyName,
          companyAddress: userData.companyAddress,
          registrationDate: new Date()
        };
      }

      // Remove temporary fields
      delete userData.department;
      delete userData.designation;
      delete userData.companyName;
      delete userData.companyAddress;

      const user = new UserModel(userData);
      await user.save();

      // TODO: Send welcome email to user
      // mailSvc.sendWelcomeEmail(user.email, user.name, user.role, user.activationToken);

      return this.getUserById(user._id);
    } catch (error) {
      throw error;
    }
  };

  // Update user
  updateUser = async (userId, updateData, file) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Handle file upload
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
      if (!allowedTypes.includes(file.mimetype)) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Invalid image format",
          statusCode: HttpResponse.validationFailed
        };
      }

      const uploadResult = await CloudinaryService.uploadImage(file.path, 'nagaralert/users');
      updateData.profileImage = uploadResult.url;
    }

    // Update role-specific profile
    if (updateData.role === "citizen") {
      updateData.citizenProfile = {
        address: updateData.address || user.citizenProfile?.address,
        ward: updateData.ward || user.citizenProfile?.ward,
        location: updateData.location ? {
          type: "Point",
          coordinates: [updateData.location.longitude, updateData.location.latitude],
          address: updateData.location.address || ""
        } : user.citizenProfile?.location,
        updatedAt: new Date()
      };
    } else if (updateData.role === "field_staff" && (updateData.department || updateData.designation)) {
      updateData.staffProfile = {
        department: updateData.department || user.staffProfile?.department,
        designation: updateData.designation || user.staffProfile?.designation,
        updatedAt: new Date()
      };
    }

    // Remove temporary fields
    delete updateData.department;
    delete updateData.designation;

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    )
    .populate("municipalityId", "name location.city")
    .select("-password -activationToken -resetToken -tokenExpiry");

    return updatedUser;
  };

  // Delete user
  deleteUser = async (userId) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Prevent deletion of system admin
    if (user.role === "sys_admin") {
      throw {
        status: HttpResponseCode.FORBIDDEN,
        message: "Cannot delete system administrator",
        statusCode: HttpResponse.accessDenied
      };
    }

    await UserModel.findByIdAndDelete(userId);
    return true;
  };

  // Change user status
  changeUserStatus = async (userId, status) => {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "User not found",
        statusCode: HttpResponse.notFound
      };
    }

    const updatedUser = await UserModel.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true }
    )
    .select("-password -activationToken -resetToken -tokenExpiry");

    return updatedUser;
  };

  // Get dashboard statistics
  getDashboardStats = async (period = "all", municipalityId = null) => {
    try {
      // Calculate date filter based on period
      let dateFilter = {};
      if (period === "today") {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        dateFilter = { createdAt: { $gte: today } };
      } else if (period === "week") {
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: weekAgo } };
      } else if (period === "month") {
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        dateFilter = { createdAt: { $gte: monthAgo } };
      }

      // Add municipality filter if provided
      const filter = { ...dateFilter };
      if (municipalityId) {
        filter.municipalityId = municipalityId;
      }

      // Exclude system admin from statistics
      filter.role = { $ne: "sys_admin" };

      // Get all statistics in a single aggregation
      const stats = await UserModel.aggregate([
        { $match: filter },
        {
          $facet: {
            total: [{ $count: "count" }],
            byStatus: [
              {
                $group: {
                  _id: "$status",
                  count: { $sum: 1 }
                }
              }
            ],
            byRole: [
              {
                $group: {
                  _id: "$role",
                  count: { $sum: 1 }
                }
              }
            ],
            newUsersToday: [
              {
                $match: {
                  createdAt: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                  }
                }
              },
              { $count: "count" }
            ],
            activeToday: [
              {
                $match: {
                  lastLogin: {
                    $gte: new Date(new Date().setHours(0, 0, 0, 0))
                  },
                  status: "active"
                }
              },
              { $count: "count" }
            ],
            topCitizens: [
              { $match: { role: "citizen" } },
              { $sort: { points: -1 } },
              { $limit: 5 },
              {
                $project: {
                  name: 1,
                  email: 1,
                  points: 1,
                  profileImage: 1,
                  lastLogin: 1
                }
              }
            ]
          }
        }
      ]);

      // Format the response
      const result = stats[0];
      
      // Format byStatus
      const statusMap = {
        active: 0,
        pending: 0,
        inactive: 0,
        suspended: 0
      };
      result.byStatus.forEach(item => {
        statusMap[item._id] = item.count;
      });

      // Format byRole
      const roleMap = {
        citizen: 0,
        municipality_admin: 0,
        field_staff: 0,
        sponsor: 0
      };
      result.byRole.forEach(item => {
        roleMap[item._id] = item.count;
      });

      return {
        total: result.total[0]?.count || 0,
        byStatus: statusMap,
        byRole: roleMap,
        newUsersToday: result.newUsersToday[0]?.count || 0,
        activeToday: result.activeToday[0]?.count || 0,
        topCitizens: result.topCitizens,
        period,
        municipalityId
      };
    } catch (error) {
      throw error;
    }
  };

  // Get municipality users (for municipality admin)
  getMunicipalityUsers = async (municipalityId, filter = {}) => {
    const {
      page = 1,
      limit = 10,
      search,
      role,
      status
    } = filter;

    const query = { municipalityId };

    // Search by name or email
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by role
    if (role) query.role = role;

    // Filter by status
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find(query)
        .select("-password -activationToken -resetToken -tokenExpiry")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      UserModel.countDocuments(query)
    ]);

    return {
      users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  // Create municipality staff (by municipality admin)
  createMunicipalityStaff = async (staffData, file, municipalityId) => {
    // Force role to be field_staff for municipality admin
    staffData.role = "field_staff";
    staffData.municipalityId = municipalityId;
    staffData.status = "active";

    return await this.createUser(staffData, file);
  };
}

const userSvc = new UserService();
export default userSvc;