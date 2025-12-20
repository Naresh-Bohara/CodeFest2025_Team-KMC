import { BackendSponsor } from "./BackendEndpoints";
import { baseApi } from "./baseApi";

export const sponsorsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    // Create a new sponsor (Admin only)
    createSponsor: builder.mutation({
      query: (formData) => ({
        url: BackendSponsor.createSponsor,
        method: "POST",
        body: formData,
        headers: {
          // Note: For file uploads, let the browser set the correct Content-Type
        },
      }),
      invalidatesTags: ['Sponsor', 'ActiveSponsors'],
    }),

    // Get all sponsors with filtering
    getSponsors: builder.query({
      query: (params = {}) => ({
        url: BackendSponsor.getSponsors,
        method: "GET",
        params, // Pass query parameters for filtering
      }),
      providesTags: ['Sponsor'],
    }),

    // Get single sponsor by ID
    getSponsorById: builder.query({
      query: (id) => ({
        url: `${BackendSponsor.getSponsorById}${id}`,
        method: "GET",
      }),
      providesTags: (result, error, id) => [{ type: 'Sponsor', id }],
    }),

    // Update sponsor (Admin only)
    updateSponsor: builder.mutation({
      query: ({ id, ...formData }) => ({
        url: `${BackendSponsor.updateSponsor}${id}`,
        method: "PUT",
        body: formData,
      }),
      invalidatesTags: (result, error, { id }) => [
        'Sponsor', 
        { type: 'Sponsor', id },
        'ActiveSponsors'
      ],
    }),

    // Delete sponsor (Admin only)
    deleteSponsor: builder.mutation({
      query: (id) => ({
        url: `${BackendSponsor.deleteSponsor}${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ['Sponsor', 'ActiveSponsors'],
    }),

    // Get active sponsors for a specific municipality
    getActiveMunicipalitySponsors: builder.query({
      query: (municipalityId) => ({
        url: `${BackendSponsor.getActiveMunicipalitySponsors}${municipalityId}/active`,
        method: "GET",
      }),
      providesTags: ['ActiveSponsors'],
    }),

    // Get global active sponsors
    getGlobalActiveSponsors: builder.query({
      query: () => ({
        url: BackendSponsor.getGlobalActiveSponsors,
        method: "GET",
      }),
      providesTags: ['ActiveSponsors'],
    }),
  }),
  overrideExisting: false,
});

export const {
  useCreateSponsorMutation,
  useGetSponsorsQuery,
  useLazyGetSponsorsQuery,
  useGetSponsorByIdQuery,
  useUpdateSponsorMutation,
  useDeleteSponsorMutation,
  useGetActiveMunicipalitySponsorsQuery,
  useLazyGetActiveMunicipalitySponsorsQuery,
  useGetGlobalActiveSponsorsQuery,
  useLazyGetGlobalActiveSponsorsQuery,
} = sponsorsApi;