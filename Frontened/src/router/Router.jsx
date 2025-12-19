import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectCurrentUser } from '../store/slices/authSlice'
import { getRoleDashboard } from '../utils/constants/routes'
import { publicRoutes } from './routes/publicRoutes'
import { protectedRoutes } from './routes/protectedRoutes'
import { RouteRenderer } from './components/RouteRenderer'
import CitizenDashboard from '../features/Dashboard/CitizenDashboard/CitizenDashboard'
import DashboardLayout from '../components/templates/DashboardLayout/DashboardLayout'
import UserProfile from '../features/Dashboard/CitizenDashboard/UserProfile'
import ReportMapView from '../features/Dashboard/CitizenDashboard/ReportMapView'
import AdminDashboardPage from '../features/Dashboard/SystemAdmin/AdminDashboardPage'
import CreateMunicipality from '../features/Dashboard/SystemAdmin/CreateMunicipality'
import ListAllMunicipalities from '../features/Dashboard/SystemAdmin/ListAllMunicipalities'
import ViewEachMunicipality from '../features/Dashboard/SystemAdmin/ViewEachMunicipality'
import EditMunicipality from '../features/Dashboard/SystemAdmin/EditMunicipality'
import SponsorsList from '../features/Dashboard/SystemAdmin/Sponsers/ListSponspors'
import SponsorForm from '../features/Dashboard/SystemAdmin/Sponsers/SponsorsForm'
import NotFoundPage from './pages/NotFound'
import MunicipalityDashboard from '../features/Dashboard/Municipality/MunicipalityDashboard'
import AdminProfile from '../features/Dashboard/SystemAdmin/AdminProfile'

// Lazy load dashboard pages for better performance
const DashboardLoader = ({ role }) => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold capitalize">{role} Dashboard</h1>
      <p className="text-gray-600">Dashboard loading...</p>
    </div>
  )
}

const Router = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated)
  const user = useSelector(selectCurrentUser)

  return (
    <Routes>
      
      {/* Dynamic Public Routes */}
      {publicRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteRenderer route={route} />}
        />
      ))}

      {/* Dynamic Protected Routes */}
      {protectedRoutes.map((route) => (
        <Route
          key={route.path}
          path={route.path}
          element={<RouteRenderer route={route} />}
        />
      ))}

      {/* Dashboard Routes - Lazy Loaded */}
      {/* <Route
        path="/dashboard/citizen"
        element={
          <RouteRenderer
            route={{
              path: '/dashboard/citizen',
              element: () => <CitizenDashboard  />,
              requireAuth: true,
              allowedRoles: ['citizen'],
            }}
          />
        }
      /> */}
  <Route
  path="/dashboard/citizen"
  element={
    <RouteRenderer
      route={{
        path: "/dashboard/citizen",
        element: () => <DashboardLayout title={"Citizen Dashboard"}  />,
        requireAuth: true,
        allowedRoles: ["citizen"],
      }}
    />
  }
>
  {/* Child Pages */}
  <Route index element={<CitizenDashboard/>} />
  <Route path="profile" element={<UserProfile />} />
  <Route path="reports" element={<ReportMapView/>}/>
</Route>


      <Route
        path="/dashboard/municipality-admin"
        element={
          <RouteRenderer
            route={{
              path: '/dashboard/municipality-admin',
              element: () => <DashboardLayout  title={"Municipality Admin Dashboard"} />,
              requireAuth: true,
              allowedRoles: ['municipality_admin'],
            }}
          />
        }

      >
          <Route index element={<MunicipalityDashboard/>}/>
        </Route>


      <Route
        path="/dashboard/system-admin"
        element={
          <RouteRenderer
            route={{
              path: '/dashboard/system-admin',
              element: () => <DashboardLayout  title={"System Admin Dashboard"} />,
              requireAuth: true,
              allowedRoles: ['system_admin'],
            }}
          />
        }
      >
         <Route index element={<AdminDashboardPage/>} />
         <Route path='municipalities' element={<ListAllMunicipalities/>}/>
         <Route path='create-municipalities' element={<CreateMunicipality/>}/>
         <Route path='municipalities/:id' element={<ViewEachMunicipality/>}/>
         <Route path='municipalities/edit/:id' element={<EditMunicipality/>}/>
         <Route path='sponsors' element={<SponsorsList/>}/>
         <Route path='add-sponsors' element={<SponsorForm/>}/>
         {/* <Route path='editmunicipalities' element={} */}
      </Route>

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          <Navigate
            to={isAuthenticated ? getRoleDashboard(user?.role) : '/login'}
            replace
          />
        }
      />

      {/* Dashboard Redirect */}
      <Route
        path="/dashboard"
        element={
          <Navigate
            to={isAuthenticated ? getRoleDashboard(user?.role) : '/login'}
            replace
          />
        }
      />

      {/* 404 Page */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default Router