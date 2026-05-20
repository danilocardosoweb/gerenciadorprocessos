import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  department?: string;
  status: 'Ativo' | 'Inativo';
  created_at?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon: string;
  isDefault?: boolean;
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    const [{ data: usersData, error: usersErr }, { data: deptsData, error: deptsErr }] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('departments').select('*').order('name', { nullsFirst: false }),
    ]);
    if (usersErr) {
      console.error('❌ useUsers fetchAll error:', usersErr);
      setError(usersErr.message);
    } else if (usersData) {
      setUsers(usersData.map(u => ({ ...u, status: u.status || 'Ativo' })));
    }
    if (deptsErr) {
      console.error('❌ useUsers fetchDepts error:', deptsErr);
    } else if (deptsData) {
      setDepartments(deptsData);
    }
    setLoading(false);
  };

  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at'> & { password?: string }) => {
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .insert({ name: userData.name, email: userData.email, role: userData.role, department: userData.department, status: userData.status })
        .select().single();
      if (error) throw error;
      setUsers(prev => [...prev, { ...data, status: data.status || 'Ativo' }]);
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const updateUser = useCallback(async (id: string, userData: Partial<User> & { password?: string }) => {
    setError(null);
    try {
      const { error } = await supabase.from('users').update({
        name: userData.name, email: userData.email, role: userData.role,
        department: userData.department, status: userData.status,
      }).eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.map(u => u.id === id ? { ...u, ...userData } : u));
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const deleteUser = useCallback(async (id: string) => {
    setError(null);
    try {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      setUsers(prev => prev.filter(u => u.id !== id));
      return { success: true };
    } catch (err: any) {
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  const addDepartment = useCallback(async (dept: Omit<Department, 'id'>) => {
    try {
      const { isDefault, ...dbDept } = dept as any;
      const { data, error } = await supabase.from('departments').insert(dbDept).select().single();
      if (error) throw error;
      setDepartments(prev => [...prev, data]);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const updateDepartment = useCallback(async (id: string, dept: Partial<Department>) => {
    try {
      const { isDefault, ...dbDept } = dept as any;
      const { error } = await supabase.from('departments').update(dbDept).eq('id', id);
      if (error) throw error;
      setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...dept } : d));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  const deleteDepartment = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.from('departments').delete().eq('id', id);
      if (error) throw error;
      setDepartments(prev => prev.filter(d => d.id !== id));
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }, []);

  return {
    users,
    departments,
    loading,
    error,
    createUser,
    updateUser,
    deleteUser,
    addDepartment,
    updateDepartment,
    deleteDepartment,
    refetch: fetchAll,
  };
}
