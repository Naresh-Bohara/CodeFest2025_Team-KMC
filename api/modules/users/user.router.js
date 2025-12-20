import { Router } from "express";
import { 
  userCreateDTO, 
  userUpdateDTO, 
  userFilterDTO,
  userIdDTO,
  userStatsDTO 
} from "./user.request.js";
import { bodyValidator, queryValidator, paramsValidator } from "../../middlewares/request-validator.middleware.js";
import { checkLogin } from "../../middlewares/auth.middleware.js";
import { Require } from "../../middlewares/rbac.middleware.js";
import { profileImageUpload } from "../../config/upload.config.js"; 
import userCtrl from "./user.controller.js";

const userRouter = Router();

// SYSTEM ADMIN - Get all users with filtering
userRouter.get("/", checkLogin, Require.SysAdmin, queryValidator(userFilterDTO), userCtrl.getAllUsers);

// SYSTEM ADMIN - Get user statistics for dashboard
userRouter.get("/stats/dashboard", checkLogin, Require.SysAdmin, queryValidator(userStatsDTO), userCtrl.getDashboardStats);

// SYSTEM ADMIN - Get user by ID
userRouter.get("/:id", checkLogin, Require.SysAdmin, paramsValidator(userIdDTO), userCtrl.getUserById);

// SYSTEM ADMIN - Create new user (citizen, staff, admin, sponsor)
userRouter.post("/", checkLogin, Require.SysAdmin, profileImageUpload, bodyValidator(userCreateDTO), userCtrl.createUser);

// SYSTEM ADMIN - Update user by ID
userRouter.put("/:id", checkLogin, Require.SysAdmin, profileImageUpload, bodyValidator(userUpdateDTO), userCtrl.updateUser);

// SYSTEM ADMIN - Delete user by ID
userRouter.delete("/:id", checkLogin, Require.SysAdmin, paramsValidator(userIdDTO), userCtrl.deleteUser);

// SYSTEM ADMIN - Change user status (activate/deactivate)
userRouter.put("/:id/status", checkLogin, Require.SysAdmin, bodyValidator({ status: Joi.string().valid('active', 'inactive', 'suspended').required() }), userCtrl.changeUserStatus);

// MUNICIPALITY ADMIN - Get users in their municipality
userRouter.get("/municipality/users", checkLogin, Require.MunicipalityAdmin, queryValidator(userFilterDTO), userCtrl.getMunicipalityUsers);

// MUNICIPALITY ADMIN - Create staff in their municipality
userRouter.post("/municipality/staff", checkLogin, Require.MunicipalityAdmin, profileImageUpload, bodyValidator(userCreateDTO), userCtrl.createMunicipalityStaff);

export default userRouter;