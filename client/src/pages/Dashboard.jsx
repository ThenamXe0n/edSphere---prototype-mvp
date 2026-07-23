import React, { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import SuperAdminDashboard from '../components/dashboard/SuperAdminDashboard';
import InstituteAdminDashboard from '../components/dashboard/InstituteAdminDashboard';
import TeacherDashboard from '../components/dashboard/TeacherDashboard';
import StudentDashboard from '../components/dashboard/StudentDashboard';

const Dashboard = () => {
  const { user } = useAuth();
  const { setPageTitle } = useOutletContext();

  useEffect(() => {
    setPageTitle('System Dashboard');
  }, [setPageTitle]);

  const renderDashboardByRole = () => {
    switch (user?.role) {
      case 'Super Admin':
        return <SuperAdminDashboard />;
      case 'Institute Admin':
        return <InstituteAdminDashboard />;
      case 'Teacher':
        return <TeacherDashboard />;
      case 'Student':
      default:
        return <StudentDashboard />;
    }
  };

  return <div className="w-full">{renderDashboardByRole()}</div>;
};

export default Dashboard;
