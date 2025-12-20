import DashboardLayout from "../../../layouts/DashboardLayout"

export default function StaffDashboard() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Municipality Staff Dashboard</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="font-semibold">Assigned Tasks</h2>
          <p>Fix and update report statuses.</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="font-semibold">Reports to Review</h2>
          <p>Reports assigned by admin.</p>
        </div>

      </div>
    </DashboardLayout>
  )
}
