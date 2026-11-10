import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const DEMO_USERS = {
  patient: {
    id: 'USR-PATIENT-001',
    name: 'Rajesh Kumar',
    name_kn: 'ರಾಜೇಶ್ ಕುಮಾರ್',
    role: 'patient',
    identifier: '9876543210',
    email: 'rajesh.kumar@gmail.com',
    phone: '+91 98765 43210',
    department: 'Outpatient / General Ward',
    roleLabel: 'Citizen / Patient',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200'
  },
  staff: {
    id: 'USR-STAFF-409',
    name: 'Dr. Sunita Rao',
    name_kn: 'ಡಾ. ಸುನೀತಾ ರಾವ್',
    role: 'staff',
    identifier: 'staff@district-hospital.gov.in',
    email: 'staff@district-hospital.gov.in',
    phone: '+91 80 2345 6789',
    department: 'Pharmacy & Medical Supplies',
    designation: 'Senior Medical Officer & Duty In-Charge',
    roleLabel: 'Hospital Staff',
    badgeColor: 'bg-blue-50 text-[#0052ff] border-blue-200'
  },
  admin: {
    id: 'USR-ADMIN-100',
    name: 'Dr. A. K. Sharma',
    name_kn: 'ಡಾ. ಎ. ಕೆ. ಶರ್ಮಾ',
    role: 'admin',
    identifier: 'admin@carevoice.gov.in',
    email: 'admin@carevoice.gov.in',
    phone: '+91 80 2200 1122',
    department: 'Hospital Administration / Medical Superintendent',
    designation: 'Medical Superintendent & District Nodal Officer',
    roleLabel: 'Hospital Administrator',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200'
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('carevoice_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('carevoice_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('carevoice_user');
    }
  }, [user]);

  const login = (role, customData = {}) => {
    const base = DEMO_USERS[role] || DEMO_USERS.patient;
    const userData = {
      ...base,
      ...customData,
      role: role
    };
    setUser(userData);
    return userData;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        login,
        logout,
        DEMO_USERS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

