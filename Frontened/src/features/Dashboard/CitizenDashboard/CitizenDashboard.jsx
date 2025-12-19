import { useGetAllMunicipalitiesQuery } from "../../../store/api/Municipality";
import { useGetMyReportsQuery } from "../../../store/api/reportApi";
import CreateReportForm from "./CreateReport";

export default function CitizenDashboard() {
  const {data:munidata}=useGetAllMunicipalitiesQuery();
  console.log(munidata);
  const {data:myreport}=useGetMyReportsQuery();
  console.log(myreport)
  return (

    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold">Your Reports</h2>
        <p className="text-gray-600">Track your submitted reports.</p>
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold">Rewards</h2>
        <p className="text-gray-600">View reward points and redeem.</p>
      </div>

      <div className="p-4 bg-white rounded-xl shadow">
        <h2 className="text-lg font-semibold">Leaderboard</h2>
        <p className="text-gray-600">Check top contributors.</p>
      </div>
      <CreateReportForm/>
    </div>
   
  )
}
