import React, { useState } from 'react'
import {  useGetProfileQuery } from '../../../store/api/authApi'
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaUser, FaCalendarAlt, FaAward } from 'react-icons/fa'

const UserProfile = () => {
  const { data: data, isLoading, isError } = useGetProfileQuery()
    const profile=data?.data;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-gray-500 text-lg">Loading profile...</p>
      </div>
    )
  }

  if (isError || !profile) {
    return (
      <div className="flex justify-center items-center h-full">
        <p className="text-red-500 text-lg">Failed to load profile.</p>
      </div>
    )
  }

  return (
    <div className="p-6 w-full max-w-7xl mx-auto">
      
      {/* Profile Header */}
      <div className="bg-white shadow-lg rounded-xl p-8 flex flex-col md:flex-row items-center md:items-start gap-6">
        <img
          src={profile.profileImage || '/default-avatar.png'}
          alt={profile.name}
          className="w-32 h-32 rounded-full object-cover border-4 border-indigo-500"
        />
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-800">{profile.name}</h1>
          <p className="text-indigo-600 font-medium capitalize">{profile.role}</p>
          <p className="text-green-500 font-semibold mt-1">{profile.status}</p>
        </div>
      </div>

      {/* Personal & Contact Info */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Personal Info</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2"><FaUser className="text-indigo-500"/> User ID: {profile._id}</li>
            <li className="flex items-center gap-2"><FaCalendarAlt className="text-indigo-500"/> Last Login: {new Date(profile.lastLogin).toLocaleString()}</li>
            <li className="flex items-center gap-2"><FaMapMarkerAlt className="text-indigo-500"/> Municipality ID: {profile.municipalityId}</li>
          </ul>
        </div>

        <div className="bg-white p-6 rounded-xl shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Contact Info</h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-center gap-2"><FaEnvelope className="text-indigo-500"/> Email: {profile.email}</li>
            <li className="flex items-center gap-2"><FaPhone className="text-indigo-500"/> Phone: {profile.phone}</li>
          </ul>
        </div>
      </div>

      {/* Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
          <FaAward className="text-indigo-500 text-3xl mb-2"/>
          <p className="text-gray-700">Points</p>
          <p className="text-2xl font-bold text-gray-800">{profile.points}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-700">Status</p>
          <p className="text-2xl font-bold text-green-500">{profile.status}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow flex flex-col items-center">
          <p className="text-gray-700">Role</p>
          <p className="text-2xl font-bold text-indigo-600 capitalize">{profile.role}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-8 flex gap-4">
        <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg transition">
          Edit Profile
        </button>
        <button className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition">
          Change Password
        </button>
            
      </div>

    </div>
  )
}

export default UserProfile
