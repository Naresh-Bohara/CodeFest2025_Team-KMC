import { BackendUser } from "./BackendUser";
import { baseApi } from "./baseApi";

export const usersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Get all users (with filters)
    getUsers: builder.query({
      query: (params) => ({
        url: BackendUser.getUsers,
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),

    // Get user by ID
    getUserById: builder.query({
      query: (id) => ({
        url: `${BackendUser.getUserById}${id}`,
        method: "GET",
      }),
    }),

    // Get dashboard statistics
    getUserDashboardStats: builder.query({
      query: (params) => ({
        url: BackendUser.getDashboardStats,
        method: "GET",
        params,
      }),
    }),

    // Create user
    createUser: builder.mutation({
      query: (formData) => ({
        url: BackendUser.createUser,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Users"],
    }),

    // Update user
    updateUser: builder.mutation({
      query: ({ id, data }) => ({
        url: `${BackendUser.updateUser}${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Users"],
    }),

    // Delete user
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `${BackendUser.deleteUser}${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),

    // Change user status
    changeUserStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `${BackendUser.changeUserStatus}${id}/status`,
        method: "PUT",
        body: { status },
      }),
      invalidatesTags: ["Users"],
    }),

    /* =========================
       MUNICIPALITY ADMIN
    ========================== */

    // Get municipality users
    getMunicipalityUsers: builder.query({
      query: (params) => ({
        url: BackendUser.getMunicipalityUsers,
        method: "GET",
        params,
      }),
      providesTags: ["Users"],
    }),

    // Create municipality staff
    createMunicipalityStaff: builder.mutation({
      query: (formData) => ({
        url: BackendUser.createMunicipalityStaff,
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["Users"],
    }),

  }),
  overrideExisting: false,
});



export const {
  // SYSTEM ADMIN
  useGetUsersQuery,
  useGetUserByIdQuery,
  useGetUserDashboardStatsQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useChangeUserStatusMutation,

  // MUNICIPALITY ADMIN
  useGetMunicipalityUsersQuery,
  useCreateMunicipalityStaffMutation,
} = usersApi;
