import ReportModel from "./report.model.js";
import MunicipalityModel from "../municipalities/municipality.model.js";
import CloudinaryService from "../../services/cloudinary.service.js";
import HttpResponseCode from "../../constants/http-status-code.contants.js";
import HttpResponse from "../../constants/response-status.contants.js";
import UserModel from "../users/user.model.js";

class ReportService {
  createReport = async (reportData, files, citizenId) => {
    try {
      // 1. BASIC VALIDATION: Check municipality exists
      const municipality = await MunicipalityModel.findById(reportData.municipalityId);
      if (!municipality) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Municipality not found",
          statusCode: HttpResponse.validationFailed
        };
      }

      // 2. SIMPLE CATEGORY VALIDATION: Check if municipality accepts this category
      if (municipality.reportCategories && municipality.reportCategories.length > 0) {
        if (!municipality.reportCategories.includes(reportData.category)) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: `This municipality doesn't accept ${reportData.category} reports`,
            statusCode: HttpResponse.validationFailed,
            data: {
              acceptedCategories: municipality.reportCategories
            }
          };
        }
      }

      // 3. SIMPLE LOCATION VALIDATION (Basic Nepal coordinates check)
      if (reportData.location?.coordinates) {
        const { lat, lng } = reportData.location.coordinates;
        
        // Basic Nepal coordinates range
        const isWithinNepal = lat >= 26.0 && lat <= 31.0 && lng >= 80.0 && lng <= 89.0;
        
        if (!isWithinNepal) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Invalid coordinates. Please use valid Nepal coordinates.",
            statusCode: HttpResponse.validationFailed
          };
        }
      } else {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Location coordinates are required",
          statusCode: HttpResponse.validationFailed
        };
      }

      // 4. DUPLICATE REPORT CHECK (Simple version)
      const recentDuplicate = await ReportModel.findOne({
        citizenId: citizenId,
        category: reportData.category,
        status: { $in: ['pending', 'assigned', 'in_progress'] },
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      if (recentDuplicate) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "You already have an active report for this category in the last 24 hours",
          statusCode: HttpResponse.validationFailed,
          data: {
            existingReportId: recentDuplicate._id,
            status: recentDuplicate.status
          }
        };
      }

      // 5. FILE VALIDATION
      const uploadedPhotos = [];
      const uploadedVideos = [];
      
      if (files?.photos) {
        // Validate photo count (max 5)
        if (files.photos.length > 5) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Maximum 5 photos allowed per report",
            statusCode: HttpResponse.validationFailed
          };
        }

        for (const photo of files.photos) {
          // Validate file type
          const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
          if (!allowedTypes.includes(photo.mimetype)) {
            throw {
              status: HttpResponseCode.BAD_REQUEST,
              message: `Invalid file type for ${photo.originalname}. Only JPG, PNG, WebP allowed`,
              statusCode: HttpResponse.validationFailed
            };
          }

          // Validate file size (max 5MB)
          if (photo.size > 5 * 1024 * 1024) {
            throw {
              status: HttpResponseCode.BAD_REQUEST,
              message: `File ${photo.originalname} is too large. Maximum 5MB allowed`,
              statusCode: HttpResponse.validationFailed
            };
          }

          const uploadResult = await CloudinaryService.uploadReportImage(photo.path, `report_${Date.now()}`);
          uploadedPhotos.push(uploadResult.url);
        }
      }

      if (files?.videos) {
        // Validate video count (max 2)
        if (files.videos.length > 2) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: "Maximum 2 videos allowed per report",
            statusCode: HttpResponse.validationFailed
          };
        }

        for (const video of files.videos) {
          // Validate video type
          const allowedVideoTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
          if (!allowedVideoTypes.includes(video.mimetype)) {
            throw {
              status: HttpResponseCode.BAD_REQUEST,
              message: `Invalid video type for ${video.originalname}. Only MP4, MPEG, MOV allowed`,
              statusCode: HttpResponse.validationFailed
            };
          }

          // Validate video size (max 50MB)
          if (video.size > 50 * 1024 * 1024) {
            throw {
              status: HttpResponseCode.BAD_REQUEST,
              message: `Video ${video.originalname} is too large. Maximum 50MB allowed`,
              statusCode: HttpResponse.validationFailed
            };
          }

          const uploadResult = await CloudinaryService.uploadReportVideo(video.path, `report_${Date.now()}`);
          uploadedVideos.push(uploadResult.url);
        }
      }

      // 6. SEVERITY VALIDATION
      if (reportData.severity === 'emergency' && !uploadedPhotos.length && !uploadedVideos.length) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: "Emergency reports require photo/video evidence",
          statusCode: HttpResponse.validationFailed
        };
      }

      // 7. Create and save report
      const report = new ReportModel({
        ...reportData,
        citizenId,
        photos: uploadedPhotos,
        videos: uploadedVideos,
        validationInfo: {
          locationValidated: true,
          filesValidated: true,
          totalFiles: (uploadedPhotos.length + uploadedVideos.length)
        }
      });

      await report.save();
      return report;

    } catch (error) {
      throw error;
    }
  }

  // SIMPLE boundary check - only if boundary exists
  isLocationWithinBoundary = (lat, lng, boundaryBox) => {
    // Only validate if boundary has all required fields
    if (!boundaryBox || 
        !boundaryBox.minLat || 
        !boundaryBox.maxLat ||
        !boundaryBox.minLng ||
        !boundaryBox.maxLng) {
      console.log('No valid boundary box, accepting all coordinates');
      return true;
    }

    const isWithin = lat >= boundaryBox.minLat && 
                     lat <= boundaryBox.maxLat && 
                     lng >= boundaryBox.minLng && 
                     lng <= boundaryBox.maxLng;
    
    return isWithin;
  }

  // Update report method with basic validation
  updateReport = async (reportId, updateData, files, citizenId) => {
    const report = await ReportModel.findOne({ _id: reportId, citizenId });

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found or you don't have permission",
        statusCode: HttpResponse.notFound
      };
    }

    // Can only update pending reports
    if (report.status !== 'pending') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot update report after it has been processed",
        statusCode: HttpResponse.validationFailed,
        data: {
          currentStatus: report.status
        }
      };
    }

    // Validate new photos
    if (files?.photos) {
      if (files.photos.length + report.photos.length > 5) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: `Maximum 5 photos allowed. You already have ${report.photos.length} photos`,
          statusCode: HttpResponse.validationFailed
        };
      }

      for (const photo of files.photos) {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(photo.mimetype)) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: `Invalid file type. Only JPG, PNG, WebP allowed`,
            statusCode: HttpResponse.validationFailed
          };
        }

        const uploadResult = await CloudinaryService.uploadReportImage(photo.path, `report_${Date.now()}`);
        report.photos.push(uploadResult.url);
      }
    }

    // Validate new videos
    if (files?.videos) {
      if (files.videos.length + report.videos.length > 2) {
        throw {
          status: HttpResponseCode.BAD_REQUEST,
          message: `Maximum 2 videos allowed. You already have ${report.videos.length} videos`,
          statusCode: HttpResponse.validationFailed
        };
      }

      for (const video of files.videos) {
        const allowedTypes = ['video/mp4', 'video/mpeg', 'video/quicktime'];
        if (!allowedTypes.includes(video.mimetype)) {
          throw {
            status: HttpResponseCode.BAD_REQUEST,
            message: `Invalid video type. Only MP4, MPEG, MOV allowed`,
            statusCode: HttpResponse.validationFailed
          };
        }

        const uploadResult = await CloudinaryService.uploadReportVideo(video.path, `report_${Date.now()}`);
        report.videos.push(uploadResult.url);
      }
    }

    // Update other fields (except status and assigned fields)
    const nonEditableFields = ['status', 'assignedStaffId', 'assignedAt', 'resolvedAt', 'pointsAwarded'];
    Object.keys(updateData).forEach(key => {
      if (updateData[key] !== undefined && !nonEditableFields.includes(key)) {
        report[key] = updateData[key];
      }
    });

    await report.save();
    return report;
  }

  getReports = async (filter = {}) => {
    const { page = 1, limit = 10, category, status, severity, ...otherFilters } = filter;

    const query = { ...otherFilters };
    if (category) query.category = category;
    if (status) query.status = status;
    if (severity) query.severity = severity;

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage')
        .populate('municipalityId', 'name location.city')
        .populate('assignedStaffId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  getReportById = async (reportId) => {
    const report = await ReportModel.findById(reportId)
      .populate('citizenId', 'name profileImage phone')
      .populate('municipalityId', 'name location contactEmail contactPhone')
      .populate('assignedStaffId', 'name profileImage phone');

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    return report;
  }

  deleteReport = async (reportId, citizenId) => {
    const report = await ReportModel.findOne({ _id: reportId, citizenId });

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found or you don't have permission",
        statusCode: HttpResponse.notFound
      };
    }

    if (report.status !== 'pending') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot delete report after it has been processed",
        statusCode: HttpResponse.validationFailed,
        data: {
          currentStatus: report.status
        }
      };
    }

    await ReportModel.findByIdAndDelete(reportId);
    return true;
  };

  updateReportStatus = async (reportId, updateData, staffId) => {
    const report = await ReportModel.findById(reportId);
    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    const staffUser = await UserModel.findById(staffId);
    if (!staffUser) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Staff user not found",
        statusCode: HttpResponse.notFound
      };
    }

    // Check municipality access
    if (staffUser.municipalityId && report.municipalityId) {
      if (staffUser.municipalityId.toString() !== report.municipalityId.toString()) {
        throw {
          status: HttpResponseCode.FORBIDDEN,
          message: "Access denied. You can only manage reports from your municipality",
          statusCode: HttpResponse.accessDenied
        };
      }
    }

    // Status transition validation
    const validTransitions = {
      'pending': ['assigned', 'resolved'],
      'assigned': ['in_progress', 'resolved'],
      'in_progress': ['resolved'],
      'resolved': []
    };

    if (updateData.status && !validTransitions[report.status]?.includes(updateData.status)) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: `Invalid status transition from ${report.status} to ${updateData.status}`,
        statusCode: HttpResponse.validationFailed,
        data: {
          allowedTransitions: validTransitions[report.status]
        }
      };
    }

    const statusUpdates = { ...updateData };

    // Set timestamps based on status changes
    if (updateData.status === 'assigned' && report.status !== 'assigned') {
      statusUpdates.assignedAt = new Date();
    }

    if (updateData.status === 'in_progress' && report.status !== 'in_progress') {
      statusUpdates.inProgressAt = new Date();
    }

    if (updateData.status === 'resolved' && report.status !== 'resolved') {
      statusUpdates.resolvedAt = new Date();
      statusUpdates.pointsAwarded = this.calculatePoints(report.category);
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      reportId,
      { $set: statusUpdates },
      { new: true }
    )
    .populate('assignedStaffId', 'name profileImage phone')
    .populate('citizenId', 'name profileImage')
    .populate('municipalityId', 'name location.city');

    return updatedReport;
  };

  calculatePoints = (category) => {
    const pointsMap = {
      'emergency': 20,
      'safety': 15,
      'road': 10,
      'water': 10,
      'electricity': 10,
      'sanitation': 8,
      'illegal_activity': 12
    };
    return pointsMap[category] || 5;
  };

  getMyReports = async (citizenId, filter = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filter;

    const query = { citizenId, ...otherFilters };
    const skip = (page - 1) * limit;

    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('municipalityId', 'name location.city')
        .populate('assignedStaffId', 'name profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };

  assignReport = async (reportId, assignData, adminMunicipalityId) => {
    const { assignedStaffId, priority, dueDate, notes } = assignData;

    const report = await ReportModel.findOne({
      _id: reportId,
      municipalityId: adminMunicipalityId
    })
    .populate('citizenId', 'name email phone');

    if (!report) {
      throw {
        status: HttpResponseCode.NOT_FOUND,
        message: "Report not found",
        statusCode: HttpResponse.notFound
      };
    }

    if (report.status === 'resolved') {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Cannot assign a report that has already been resolved",
        statusCode: HttpResponse.validationFailed,
        data: {
          currentStatus: report.status,
          resolvedAt: report.resolvedAt
        }
      };
    }

    const staff = await UserModel.findOne({
      _id: assignedStaffId,
      municipalityId: adminMunicipalityId,
      role: { $in: ['municipality_admin', 'field_staff'] }
    })
    .select('name email phone profileImage staffProfile');

    if (!staff) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Staff member not found or invalid",
        statusCode: HttpResponse.validationFailed,
        data: {
          validRoles: ['municipality_admin', 'field_staff']
        }
      };
    }

    // Validate due date (max 30 days)
    const maxDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const finalDueDate = dueDate || report.dueDate;
    
    if (finalDueDate && finalDueDate > maxDueDate) {
      throw {
        status: HttpResponseCode.BAD_REQUEST,
        message: "Due date cannot be more than 30 days in the future",
        statusCode: HttpResponse.validationFailed
      };
    }

    const updateData = {
      assignedStaffId,
      status: 'assigned',
      priority: priority || report.priority,
      assignmentNotes: notes,
      assignedAt: new Date()
    };

    if (dueDate || !report.dueDate) {
      updateData.dueDate = dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const updatedReport = await ReportModel.findByIdAndUpdate(
      reportId,
      { $set: updateData },
      { new: true }
    )
    .populate('citizenId', 'name profileImage phone email')
    .populate('municipalityId', 'name location.city contactPhone')
    .populate('assignedStaffId', 'name email phone profileImage staffProfile.department staffProfile.designation');

    return updatedReport;
  };

  getAssignedReports = async (staffId, filter = {}) => {
    const { page = 1, limit = 10, ...otherFilters } = filter;
    const query = { 
      assignedStaffId: staffId, 
      ...otherFilters 
    };

    const skip = (page - 1) * limit;
    const [reports, total] = await Promise.all([
      ReportModel.find(query)
        .populate('citizenId', 'name profileImage phone')
        .populate('municipalityId', 'name location.city')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      ReportModel.countDocuments(query)
    ]);

    return {
      reports,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    };
  };
  
  getDashboardCounts = async () => {
  try {
    // Single aggregation query for all counts - MOST EFFICIENT
    const result = await ReportModel.aggregate([
      {
        $facet: {
          total: [{ $count: "count" }],
          pending: [
            { $match: { status: "pending" } },
            { $count: "count" }
          ],
          assigned: [
            { $match: { status: "assigned" } },
            { $count: "count" }
          ],
          in_progress: [
            { $match: { status: "in_progress" } },
            { $count: "count" }
          ],
          resolved: [
            { $match: { status: "resolved" } },
            { $count: "count" }
          ]
        }
      }
    ]);

    // Extract counts with fallback to 0
    const counts = result[0];
    
    return {
      total: counts.total[0]?.count || 0,
      pending: counts.pending[0]?.count || 0,
      assigned: counts.assigned[0]?.count || 0,
      in_progress: counts.in_progress[0]?.count || 0,
      resolved: counts.resolved[0]?.count || 0
    };

  } catch (error) {
    throw error;
  }
}
}

const reportSvc = new ReportService();
export default reportSvc;