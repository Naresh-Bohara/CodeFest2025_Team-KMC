import HttpResponse from "../../constants/response-status.contants.js";
import userSvc from "./user.service.js";

class UserController {
  // Get all users
  getAllUsers = async (req, res, next) => {
    try {
      const filter = req.validatedQuery || req.query;
      const result = await userSvc.getAllUsers(filter);

      res.json({
        data: result.users,
        pagination: result.pagination,
        message: "Users fetched successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Get user by ID
  getUserById = async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = await userSvc.getUserById(id);

      res.json({
        data: user,
        message: "User fetched successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Create user
  createUser = async (req, res, next) => {
    try {
      const userData = req.body;
      const file = req.file;
      const user = await userSvc.createUser(userData, file);

      res.status(201).json({
        data: user,
        message: "User created successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Update user
  updateUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const file = req.file;
      const user = await userSvc.updateUser(id, updateData, file);

      res.json({
        data: user,
        message: "User updated successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Delete user
  deleteUser = async (req, res, next) => {
    try {
      const { id } = req.params;
      await userSvc.deleteUser(id);

      res.json({
        data: null,
        message: "User deleted successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Change user status
  changeUserStatus = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const user = await userSvc.changeUserStatus(id, status);

      res.json({
        data: user,
        message: `User status changed to ${status}`,
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Get dashboard statistics
  getDashboardStats = async (req, res, next) => {
    try {
      const { period = "all", municipalityId } = req.query;
      const stats = await userSvc.getDashboardStats(period, municipalityId);

      res.json({
        data: stats,
        message: "Dashboard statistics fetched successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Get municipality users
  getMunicipalityUsers = async (req, res, next) => {
    try {
      const municipalityId = req.loggedInUser.municipalityId;
      const filter = req.validatedQuery || req.query;
      const result = await userSvc.getMunicipalityUsers(municipalityId, filter);

      res.json({
        data: result.users,
        pagination: result.pagination,
        message: "Municipality users fetched successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };

  // Create municipality staff
  createMunicipalityStaff = async (req, res, next) => {
    try {
      const staffData = req.body;
      const file = req.file;
      const municipalityId = req.loggedInUser.municipalityId;
      const user = await userSvc.createMunicipalityStaff(staffData, file, municipalityId);

      res.status(201).json({
        data: user,
        message: "Staff member created successfully",
        status: HttpResponse.success,
        options: null
      });
    } catch (exception) {
      next(exception);
    }
  };
}

const userCtrl = new UserController();
export default userCtrl;