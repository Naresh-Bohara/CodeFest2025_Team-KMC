import DashboardLayout from "../../../components/templates/DashboardLayout/DashboardLayout";

export default function MunicipalityAdmin() {
  return (
    <DashboardLayout>
      <h1 className="text-2xl font-bold">Municipality Admin Dashboard</h1>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        
        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Total Reports</h2>
          <p>View all citizen-submitted issues.</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Staff Management</h2>
          <p>Assign and manage staff duties.</p>
        </div>

        <div className="p-4 bg-white rounded-xl shadow">
          <h2 className="text-lg font-semibold">Analytics</h2>
          <p>Track city performance & metrics.</p>
        </div>

      </div>
    </DashboardLayout>
  )
}
