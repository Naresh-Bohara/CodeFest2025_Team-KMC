import { BackendMunicipality } from "./BackendEndpoints";
import { baseApi } from "./baseApi";

export const municipalityApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({

    // Get municipalities
    getMunicipalities: builder.query({
      query: () => ({
        url: BackendMunicipality.getAllMunicipalities,
        method: "GET",
      }),
    }),

    // Get all municipalities (admin)
    getAllMunicipalities: builder.query({
      query: () => ({
        url: BackendMunicipality.getallMunicipalities,
        method: "GET",
      }),
    }),

    // Get municipality by ID
    getMunicipalityById: builder.query({
      query: (id) => ({
        url: `${BackendMunicipality.getMunicipalityById}${id}`,
        method: "GET",
      }),
      skip: (id) => !id,
    }),

    // Search municipality by location
    searchMunicipality: builder.query({
      query: (location) => ({
        url: `${BackendMunicipality.searchMunicipality}${location}`,
        method: "GET",
      }),
      skip: (location) => !location,
    }),

    // Create municipality
    createMunicipality: builder.mutation({
      query: (data) => ({
        url: BackendMunicipality.createMunicipality,
        method: "POST",
        body: data,
      }),
    }),

    // Update municipality
    updateMunicipality: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `${BackendMunicipality.updateMunicipality}${id}`,
        method: "PUT",
        body: data,
      }),
    }),

    // Deactivate municipality
    deactivateMunicipality: builder.mutation({
      query: (id) => ({
        url: `${BackendMunicipality.deactivateMunicipality}${id}`,
        method: "PATCH",
      }),
    }),
  }),
  overrideExisting: false,
});



export const {
  useGetMunicipalitiesQuery,
  useGetAllMunicipalitiesQuery,
  useGetMunicipalityByIdQuery,
  useSearchMunicipalityQuery,
  useCreateMunicipalityMutation,
  useUpdateMunicipalityMutation,
  useDeactivateMunicipalityMutation,
} = municipalityApi;
