import React, { useState } from "react";
import { useGetProfileQuery } from "../../../store/api/authApi";
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  Award,
  CheckCircle,
  AlertCircle,
  MapPin,
  Building,
} from "lucide-react";

const CitizenProfile = () => {
  const { data: response, isLoading, error } = useGetProfileQuery();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse text-center space-y-4">
          <div className="h-28 w-28 rounded-full bg-gray-200 mx-auto" />
          <div className="h-4 w-40 bg-gray-200 rounded mx-auto" />
          <div className="h-4 w-56 bg-gray-200 rounded mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !response?.data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border rounded-xl p-8 text-center shadow-sm max-w-md w-full">
          <AlertCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">
            Unable to load profile
          </h2>
          <p className="text-gray-600 mt-2 text-sm">
            Please refresh or try again later.
          </p>
        </div>
      </div>
    );
  }

  const userData = response.data;

  const fields = [
    userData.name && { label: "Name", value: userData.name, icon: <User /> },
    userData.email && { label: "Email", value: userData.email, icon: <Mail /> },
    userData.phone && { label: "Phone", value: userData.phone, icon: <Phone /> },
    userData.role && { label: "Role", value: userData.role, icon: <ShieldCheck /> },
    userData.status && {
      label: "Status",
      value: userData.status,
      icon: <CheckCircle />,
    },
    userData.points !== undefined && {
      label: "Points",
      value: userData.points,
      icon: <Award />,
    },
    userData.municipalityId && {
      label: "Municipality ID",
      value: userData.municipalityId,
      icon: <Building />,
    },
    userData._id && {
      label: "User ID",
      value: userData._id,
      icon: <MapPin />,
    },
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white px-4 py-6 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            My Profile
          </h1>
          <p className="text-gray-600 mt-1 text-sm sm:text-base">
            Manage your personal information
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT CARD */}
          <div className="bg-white rounded-2xl border shadow-sm p-6 flex flex-col items-center">
            <div className="relative">
              {userData.profileImage ? (
                <img
                  src={userData.profileImage}
                  className="w-32 h-32 rounded-full object-cover border-4 border-teal-100"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-teal-100 flex items-center justify-center border-4 border-teal-200">
                  <User className="w-16 h-16 text-teal-600" />
                </div>
              )}
            </div>

            <h2 className="mt-4 text-xl font-semibold text-gray-900">
              {userData.name}
            </h2>

            {userData.role && (
              <span className="mt-1 px-3 py-1 text-xs rounded-full bg-teal-100 text-teal-700 font-medium">
                {userData.role}
              </span>
            )}

            {userData.points !== undefined && (
              <div className="mt-5 w-full bg-amber-50 border border-amber-200 rounded-lg py-3 text-center">
                <p className="text-amber-800 font-bold text-lg">
                  {userData.points} Points
                </p>
                <p className="text-xs text-amber-700">Community Contribution</p>
              </div>
            )}

            <button
              onClick={() => setIsEditing(!isEditing)}
              className="mt-6 w-full bg-teal-600 hover:bg-teal-700 text-white py-2 rounded-lg font-medium transition"
            >
              {isEditing ? "Cancel Editing" : "Edit Profile"}
            </button>
          </div>

          {/* RIGHT CARD */}
          <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Profile Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {fields.map((field, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    isEditing
                      ? "bg-teal-50 border-teal-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex items-center gap-2 text-teal-600 mb-1">
                    {field.icon}
                    <span className="text-sm font-medium text-gray-700">
                      {field.label}
                    </span>
                  </div>

                  {isEditing ? (
                    <input
                      className="w-full mt-1 px-3 py-2 rounded border focus:ring-2 focus:ring-teal-500 outline-none"
                      value={formData[field.label] ?? field.value}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.label]: e.target.value,
                        })
                      }
                    />
                  ) : (
                    <p className="text-gray-900 font-medium text-sm truncate">
                      {field.value}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {isEditing && (
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    console.log("Saved:", formData);
                    setIsEditing(false);
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition"
                >
                  Save Changes
                </button>
              </div>
            )}

            {/* Footer Info */}
            <div className="mt-6 pt-4 border-t flex flex-wrap gap-4 text-sm text-gray-600">
              {userData.status && (
                <span className="flex items-center gap-2">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      userData.status === "active"
                        ? "bg-green-500"
                        : "bg-red-500"
                    }`}
                  />
                  Status: <b>{userData.status}</b>
                </span>
              )}

              {userData.lastLogin && (
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Last Active:{" "}
                  {new Date(userData.lastLogin).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* API INFO */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-800">
          <div className="flex items-center gap-2 font-medium mb-1">
            <ShieldCheck className="w-4 h-4" />
            API Response
          </div>
          <p>Status: {response.status}</p>
          <p>Message: {response.message}</p>
        </div>
      </div>
    </div>
  );
};

export default CitizenProfile;
