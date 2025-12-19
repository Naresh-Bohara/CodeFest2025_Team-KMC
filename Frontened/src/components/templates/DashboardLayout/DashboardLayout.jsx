import React from "react"
import Sidebar from "./Sidebar"
import { Outlet } from "react-router-dom"
import { selectUserRole } from "../../../store/slices/authSlice"
import { useSelector } from "react-redux"


const DashboardLayout = ({title}) => {
 const role =useSelector(selectUserRole);
  console.log(role)
  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      
      {/* Sidebar */}
      <Sidebar role={role}/>
      {/* Main Content */}
      <div className="flex flex-col flex-1">
          <h1 className="text-2xl font-bold text-center mt-2 py-4">{title}</h1>
        {/* Page Content */}
        <div className="p-6 overflow-y-auto">
          <Outlet/>
        </div>
      </div>

    </div>
  )
}

export default DashboardLayout
