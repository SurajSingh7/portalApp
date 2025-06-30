import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import { API_BASE_URL } from '../config/api';
import { getToken, clearToken } from '../utils/storage';

const PermissionContext = createContext();

export const PermissionProvider = ({ children }) => {
  const [permissions, setPermissions] = useState([]);
  const [userData, setUserData] = useState(null);
  const [clientId, setClientId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  const fetchAuthData = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) {
        throw new Error('No token');
      }

      const res = await fetch(`${API_BASE_URL}/hrms/authdata`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'User-Agent': 'reactnative',
        },
      });

      if (res.status === 401) {
        await clearToken();
        router.replace('/');
        return;
      }

      if (res.status === 403) {
        router.replace('/unauthorized');
        return;
      }

      const result = await res.json();

      const user = result.data?.user;
      const perms = result.data?.permissions?.data;

      if (user) {
        const {
          email,
          department,
          basicemployees,
          role,
          departmentOfficialNumber,
        } = user;

        const transformedUser = {
          email,
          departmentOfficialNumber,
          department: department?.name,
          role: role?.name,
          roleId: role?._id,
          firstName: basicemployees?.firstName,
          lastName: basicemployees?.lastName,
          employeeCode: basicemployees?.employeeCode,
          profileImage: `https://api.dicebear.com/5.x/initials/png?seed=${ basicemployees?.firstName || '' } ${basicemployees?.lastName || ''}`,
        };

        setUserData(transformedUser);
        setClientId(user._id);
      } else {
        setUserData(null);
      }

      if (perms) {
        setPermissions(perms);
      } else {
        setPermissions([]);
      }
    } catch (err) {
      setError(err.message);
      await clearToken();
      router.replace('/');
    } finally {
      setLoading(false);
    }
  };

  const clearAuthData = () => {
    setPermissions([]);
    setUserData(null);
    setClientId(null);
  };

  useEffect(() => {
    fetchAuthData();
  }, []);

  return (
    <PermissionContext.Provider
      value={{
        permissions,
        userData,
        loading,
        error,
        clientId,
         fetchAuthData,
        clearAuthData,
      }}
    >
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionContext);






