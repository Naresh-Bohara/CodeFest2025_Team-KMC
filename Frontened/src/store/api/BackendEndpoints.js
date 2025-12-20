
export const BACKEND_URL=import.meta.env.VITE_BACKEND_URL;

export const BackendAuth={
    loginAuth:"/auth/login",
    registerAuth:"/auth/Register",
    otpResend:"/auth/resend-otp",
    activeUser:"/auth/activate",
    ForgetPassword:"/auth/forget-password",
    resetPassword:"/auth/reset-password",
    changePassword:"/auth/change-password",
    userProfile:"/auth/profile"
}


export const BackendCitizen={
     createReport:"/reports",
     getReports:"/reports",
     getReportsById:"/reports/",
     editReports:"/reports/",
     assignReports:"/reports/",
     getMyReports:"/reports/my/reports",
     getReportAssignToMe:"/reports/assigned/me",
     deleteOwnReports:"/reports/",
     updateReportsStatus:"/reports/"
}


export const BackendMunicipality={
    createMunicipality:"/municipalities",
    updateMunicipality:"/municipalities/",
    DeactivateMinicipality:"/municipalities/",
    searchMunicipality:"/municipalities/location/",
    getallMunicipalities:"/municipalities",
    ListAllMunicipality:"/municipalities/list/all",
    getMunicipalityById:"/municipalities/"
}


export const BackendStaff={
    createStaff:"/staffs",
    updateStaffByAdmin:"/staffs/",
    updateStaffOwnProfile:"/staffs/profile/me",
    getStaffByAdmin:"/staffs",
    getStaffById:"/staffs/",
    getStaffOwnProfile:"/staffs/profile/me",
    getAssignReports:"/staffs//reports/assigned"}



    // Add Sponsors endpoints
export const BackendSponsor = {
    createSponsor: "/sponsors",
    getSponsors: "/sponsors",
    getSponsorById: "/sponsors/",
    updateSponsor: "/sponsors/",
    deleteSponsor: "/sponsors/",
    getActiveMunicipalitySponsors: "/sponsors/municipality/",
    getGlobalActiveSponsors: "/sponsors/global/active"
};

export const BackendUser = {
  // SYSTEM ADMIN
  getUsers: "/users",
  getUserById: "/users/",
  createUser: "/users",
  updateUser: "/users/",
  deleteUser: "/users/",
  changeUserStatus: "/users/",
  getDashboardStats: "/users/stats/dashboard",

  // MUNICIPALITY ADMIN
  getMunicipalityUsers: "/users/municipality/users",
  createMunicipalityStaff: "/users/municipality/staff",
};
