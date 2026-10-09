import type React from 'react';
import ProtectedRoute from '@/hooks/auth/protected-route';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  return (
    <ProtectedRoute>
      <div>{children}</div>
    </ProtectedRoute>
  );
};

export default DashboardLayout;
