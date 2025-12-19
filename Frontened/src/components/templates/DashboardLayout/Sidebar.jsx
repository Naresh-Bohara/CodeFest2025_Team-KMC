import { 
  BarChart3, 
  Building2, 
  ClipboardList, 
  FileText, 
  Home, 
  Layers, 
  LogOut, 
  Menu, 
  Settings, 
  Shield, 
  User, 
  Users,
  AlertCircle,
  Award,
  MapPin,
  Bell,
  HelpCircle,
  PersonStanding,
  User2
} from "lucide-react";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation } from "react-router-dom";
import { logout, selectCurrentUser } from "../../../store/slices/authSlice";

const menu = {
  "citizen": [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard/citizen",
      color: "primary"
    },
    { 
      label: "My Reports", 
      icon: FileText, 
      path: "/dashboard/citizen/reports",
      color: "info"
    },
    
    { 
      label: "Profile", 
      icon: User, 
      path: "/profile",
      color: "community"
    },
  ],

  "municipality_admin": [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard/municipality-admin",
      color: "primary"
    },
    { 
      label: "Reports", 
      icon: FileText, 
      path: "/dashboard/municipality-admin/reports",
      color: "info"
    },
    { 
      label: "Manage Staff", 
      icon: Users, 
      path: "/dashboard/municipality-admin/staff",
      color: "community"
    },

    { 
      label: "Analytics", 
      icon: BarChart3, 
      path: "/dashboard/municipality-admin/analytics",
      color: "secondary"
    },
    { 
      label: "Settings", 
      icon: Settings, 
      path: "/dashboard/municipality-admin/settings",
      color: "neutral"
    },
  ],

  "municipality_staff": [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard/municipality-staff",
      color: "primary"
    },
    { 
      label: "Assigned Tasks", 
      icon: ClipboardList, 
      path: "/dashboard/municipality-staff/tasks",
      color: "info"
    },
    { 
      label: "Assignments", 
      icon: Layers, 
      path: "/dashboard/municipality-staff/assignments",
      color: "secondary"
    },
    { 
      label: "Reports", 
      icon: FileText, 
      path: "/dashboard/municipality-staff/reports",
      color: "warning"
    },
    { 
      label: "Profile", 
      icon: User, 
      path: "/profile",
      color: "community"
    },
  ],

  "system_admin": [
    { 
      label: "Dashboard", 
      icon: Home, 
      path: "/dashboard/system-admin",
      color: "primary"
    },
    { 
      label: "Municipalities", 
      icon: Building2, 
      path: "/dashboard/system-admin/municipalities",
      color: "info"
    },
    { 
      label: "Sponsors", 
      icon: Users, 
      path: "/dashboard/system-admin/sponsors",
      color: "community"
    },
  
  ],
}

const Sidebar = ({ role }) => {
  const [open, setOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState(null);
  const location = useLocation();
  const dispatch=useDispatch();
  const user = useSelector(selectCurrentUser);
const logoutHandler=()=>{
  dispatch(logout());
}
  const menuItems = menu[role] || [];

  // Get color class based on color type
  const getColorClass = (colorType, type) => {
    const colors = {
      primary: {
        bg: 'bg-primary-500',
        bgLight: 'bg-primary-100',
        bgHover: 'bg-primary-600',
        text: 'text-primary-600',
        textLight: 'text-primary-500',
        border: 'border-primary-200',
        gradient: 'from-primary-500 to-primary-600',
      },
      secondary: {
        bg: 'bg-secondary-500',
        bgLight: 'bg-secondary-100',
        bgHover: 'bg-secondary-600',
        text: 'text-secondary-600',
        textLight: 'text-secondary-500',
        border: 'border-secondary-200',
        gradient: 'from-secondary-500 to-secondary-600',
      },
      info: {
        bg: 'bg-info-500',
        bgLight: 'bg-info-100',
        bgHover: 'bg-info-600',
        text: 'text-info-600',
        textLight: 'text-info-500',
        border: 'border-info-200',
        gradient: 'from-info-500 to-info-600',
      },
      warning: {
        bg: 'bg-warning-500',
        bgLight: 'bg-warning-100',
        bgHover: 'bg-warning-600',
        text: 'text-warning-600',
        textLight: 'text-warning-500',
        border: 'border-warning-200',
        gradient: 'from-warning-500 to-warning-600',
      },
      danger: {
        bg: 'bg-danger-500',
        bgLight: 'bg-danger-100',
        bgHover: 'bg-danger-600',
        text: 'text-danger-600',
        textLight: 'text-danger-500',
        border: 'border-danger-200',
        gradient: 'from-danger-500 to-danger-600',
      },
      reward: {
        bg: 'bg-reward-500',
        bgLight: 'bg-reward-100',
        bgHover: 'bg-reward-600',
        text: 'text-reward-600',
        textLight: 'text-reward-500',
        border: 'border-reward-200',
        gradient: 'from-reward-500 to-reward-600',
      },
      community: {
        bg: 'bg-community-500',
        bgLight: 'bg-community-100',
        bgHover: 'bg-community-600',
        text: 'text-community-600',
        textLight: 'text-community-500',
        border: 'border-community-200',
        gradient: 'from-community-500 to-community-600',
      },
      environment: {
        bg: 'bg-environment-500',
        bgLight: 'bg-environment-100',
        bgHover: 'bg-environment-600',
        text: 'text-environment-600',
        textLight: 'text-environment-500',
        border: 'border-environment-200',
        gradient: 'from-environment-500 to-environment-600',
      },
      neutral: {
        bg: 'bg-neutral-500',
        bgLight: 'bg-neutral-100',
        bgHover: 'bg-neutral-600',
        text: 'text-neutral-600',
        textLight: 'text-neutral-500',
        border: 'border-neutral-200',
        gradient: 'from-neutral-500 to-neutral-600',
      },
    };
    
    return colors[colorType]?.[type] || colors.primary[type];
  };
   
  // Get role display name
  const getRoleDisplayName = (role) => {
    const roleNames = {
      citizen: 'Citizen',
      municipality_admin: 'Municipality Admin',
      municipality_staff: 'Municipality Staff',
      system_admin: 'System Admin'
    };
    return roleNames[role] || role;
  };

  return (
    <div className="flex">
      <div
        className={`${
          open ? "w-64" : "w-20"
        } h-screen bg-gradient-to-b from-primary-700 to-primary-800 text-white transition-all duration-300 flex flex-col shadow-xl animate-fade-in`}
      >
        {/* Logo Section */}
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors duration-200"
              aria-label={open ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="w-5 h-5" />
            </button>

            {open && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md">
                  <AlertCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading">NagarAlert</h1>
                  <p className="text-xs text-primary-200">Civic Engagement</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* User Info Section */}
        {open && user && (
          <div className="px-4 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-secondary-500 to-secondary-600 flex items-center justify-center shadow-md">
                <User className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user.name || user.email}</p>
                <p className="text-xs text-primary-200 truncate">
                  {getRoleDisplayName(role)}
                </p>
              </div>
            </div>
            {open && user.municipality && (
              <div className="mt-3 flex items-center gap-2 text-sm text-primary-200 bg-white/5 p-2 rounded-lg">
                <MapPin className="w-4 h-4" />
                <span className="truncate">{user.municipality.name}</span>
              </div>
            )}
          </div>
        )}

        {/* Menu Section */}
        <div className="flex-1 overflow-y-auto py-4 px-3">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const itemColor = getColorClass(item.color, 'bgLight');
              const itemTextColor = getColorClass(item.color, 'text');
              
              const isDashboard = item.path === `/dashboard/${role.replace("_", "-")}`;
              const active = isDashboard
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    active
                      ? `bg-white shadow-md ${itemTextColor} font-semibold`
                      : "hover:bg-white/10 hover:translate-x-1"
                  }`}
                  onMouseEnter={() => setActiveMenu(item.path)}
                  onMouseLeave={() => setActiveMenu(null)}
                >
                  <div className={`p-2 rounded-lg ${active ? itemColor : 'bg-white/5 group-hover:bg-white/10'} transition-colors`}>
                    <Icon className={`w-5 h-5 ${active ? itemTextColor : 'text-white'}`} />
                  </div>
                  {open && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {active && (
                        <div className="w-2 h-2 rounded-full animate-pulse-gentle bg-current"></div>
                      )}
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          {open && (
            <div className="my-6 px-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            </div>
          )}

          {/* Quick Actions */}
        
        </div>

        {/* Footer Section */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={logoutHandler}
            className={`group flex items-center justify-center gap-3 w-full py-3 rounded-xl transition-all duration-200 ${
              open 
                ? 'bg-gradient-to-r from-danger-500 to-danger-600 hover:from-danger-600 hover:to-danger-700 hover:shadow-lg' 
                : 'bg-danger-500 hover:bg-danger-600'
            } shadow-md`}
          >
            <LogOut className="w-5 h-5" />
            {open && (
              <>
                <button  className="font-medium">Logout</button>
                <span className="text-xs opacity-70">{user?.email || ''}</span>
              </>
            )}
          </button>
          
          {open && (
            <div className="mt-4 text-center">
              <p className="text-xs text-primary-300">
                NagarAlert v2.1 • Civic Platform
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {!open && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(true)} />
      )}
    </div>
  );
};

export default Sidebar;