import { BackendCitizen } from "./BackendEndpoints";
import { baseApi } from "./baseApi";

export const reportsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
  
    // Create a new report
    createReport: builder.mutation({
      query: (reportData) => ({
        url: BackendCitizen.createReport,
        method: "POST",
        body: reportData,
      }),
    }),


    // Get all reports
    getReports: builder.query({
      query: () => ({
        url: BackendCitizen.getReports,
        method: "GET",
      }),
    }),

    // Get report by ID
    getReportById: builder.query({
      query: (id) => ({
        url: `${BackendCitizen.getReportsById}${id}`,
        method: "GET",
      }),
    }),

    // Get my reports
    getMyReports: builder.query({
      query: () => ({
        url: BackendCitizen.getMyReports,
        method: "GET",
      }),
    }),

    // Get reports assigned to me
    getReportsAssignedToMe: builder.query({
      query: () => ({
        url: BackendCitizen.getReportAssignToMe,
        method: "GET",
      }),
    }),


    // Edit/update report
    editReport: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${BackendCitizen.editReports}${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // Assign report
    assignReport: builder.mutation({
      query: ({ id, assigneeId }) => ({
        url: `${BackendCitizen.assignReports}${id}/assign`,
        method: "PUT",
        body: { assigneeId },
      }),
    }),

    // Delete own report
    deleteOwnReport: builder.mutation({
      query: (id) => ({
        url: `${BackendCitizen.deleteOwnReports}${id}`,
        method: "DELETE",
      }),
    }),

    // Update report status
    updateReportStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${BackendCitizen.updateReportsStatus}${id}/status`,
        method: "PATCH",
        body: { status },
      }),
    }),
  }),
  overrideExisting: false,
});


export const {
  useCreateReportMutation,
  useGetReportsQuery,
  useGetReportByIdQuery,
  useGetMyReportsQuery,
  useGetReportsAssignedToMeQuery,
  useEditReportMutation,
  useAssignReportMutation,
  useDeleteOwnReportMutation,
  useUpdateReportStatusMutation,
} = reportsApi;
