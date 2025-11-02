import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

/**
 * Protected Route Component
 * Chặn truy cập nếu chưa đăng nhập hoặc không đủ quyền
 */
function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, nguoiDung } = useSelector((state) => state.auth);
  const location = useLocation();

  // Chưa đăng nhập -> redirect về login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Kiểm tra role nếu có yêu cầu
  if (requiredRole) {
    const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    
    if (!nguoiDung || !allowedRoles.includes(nguoiDung.vaiTro)) {
      // Không đủ quyền -> redirect về home
      return <Navigate to="/" replace />;
    }
  }

  // Đủ điều kiện -> render component
  return children;
}

export default ProtectedRoute;

