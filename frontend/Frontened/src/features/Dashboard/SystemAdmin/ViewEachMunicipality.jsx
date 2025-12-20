import React from "react";
import { useParams } from "react-router-dom";
import { useGetMunicipalityByIdQuery } from "../../../store/api/Municipality";

const ViewEachMunicipality = () => {
  const { id } = useParams(); // ✅ CORRECT
  console.log(id);
  const { data, isLoading, isError } = useGetMunicipalityByIdQuery(id);

  if (isLoading) {
    return <p className="text-center">Loading municipality...</p>;
  }

  if (isError) {
    return <p className="text-center text-red-500">Failed to load data</p>;
  }

  const municipality = data?.data || data;

  return (
    <div className="bg-white rounded-xl shadow p-6 space-y-4">
      <h1 className="text-2xl font-bold">
        {municipality?.name}
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Info label="City" value={municipality?.location?.city} />
        <Info label="Province" value={municipality?.location?.province} />
        <Info label="Contact Email" value={municipality?.contactEmail} />
        <Info label="Contact Phone" value={municipality?.contactPhone} />
        <Info
          label="Status"
          value={municipality?.isActive ? "Active" : "Inactive"}
        />
        <Info
          label="Admin"
          value={municipality?.adminId?.name}
        />
      </div>
    </div>
  );
};

const Info = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-semibold">{value || "-"}</p>
  </div>
);

export default ViewEachMunicipality;
