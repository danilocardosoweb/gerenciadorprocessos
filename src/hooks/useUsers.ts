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
}

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch users with department info
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('users')
        .select(`
          id,
          email,
          full_name,
          is_active,
          created_at,
          roles:role_id (name),
          user_departments (department:department_id (name))
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedUsers: User[] = (data || []).map((u: any) => ({
        id: u.id,
        name: u.full_name || u.email.split('@')[0],
        email: u.email,
        role: u.roles?.name || 'Visualizador',
        department: u.user_departments?.[0]?.department?.name || '',
        status: u.is_active ? 'Ativo' : 'Inativo',
        created_at: u.created_at
      }));

      setUsers(formattedUsers);
    } catch (err: any) {
      console.error('Error fetching users:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch departments
  const fetchDepartments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (err: any) {
      console.error('Error fetching departments:', err);
    }
  }, []);

  // Create user
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at'> & { password?: string }) => {
    setError(null);
    try {
      // First, get role_id from role name
      const { data: roleData } = await supabase
        .from('roles')
        .select('id')
        .eq('name', userData.role)
        .single();

      if (!roleData) throw new Error('Role not found');

      // Get department_id from department name
      let departmentId = null;
      if (userData.department) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id')
          .eq('name', userData.department)
          .single();
        departmentId = deptData?.id;
      }

      // Create user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password || 'temp123456',
        options: {
          data: {
            full_name: userData.name,
          }
        }
      });

      if (authError) throw authError;

      // Update user record with role
      if (authData.user) {
        const { error: updateError } = await supabase
          .from('users')
          .update({
            full_name: userData.name,
            role_id: roleData.id,
            is_active: userData.status === 'Ativo'
          })
          .eq('id', authData.user.id);

        if (updateError) throw updateError;

        // Link user to department if provided
        if (departmentId) {
          const { error: deptError } = await supabase
            .from('user_departments')
            .insert({
              user_id: authData.user.id,
              department_id: departmentId,
              is_manager: false
            });
          
          if (deptError) console.warn('Error linking department:', deptError);
        }
      }

      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  // Update user
  const updateUser = useCallback(async (id: string, userData: Partial<User> & { password?: string }) => {
    setError(null);
    try {
      // Get role_id from role name if provided
      let roleId = null;
      if (userData.role) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('id')
          .eq('name', userData.role)
          .single();
        roleId = roleData?.id;
      }

      // Get department_id from department name if provided
      let departmentId = null;
      if (userData.department) {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id')
          .eq('name', userData.department)
          .single();
        departmentId = deptData?.id;
      }

      // Update user
      const updates: any = {};
      if (userData.name) updates.full_name = userData.name;
      if (roleId) updates.role_id = roleId;
      if (userData.status !== undefined) updates.is_active = userData.status === 'Ativo';

      const { error: updateError } = await supabase
        .from('users')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      // Update password if provided
      if (userData.password) {
        const { error: pwError } = await supabase.auth.updateUser({
          password: userData.password
        });
        if (pwError) console.warn('Error updating password:', pwError);
      }

      // Update department link
      if (departmentId !== undefined) {
        // Remove existing links
        await supabase.from('user_departments').delete().eq('user_id', id);
        
        // Add new link if department provided
        if (departmentId) {
          await supabase.from('user_departments').insert({
            user_id: id,
            department_id: departmentId,
            is_manager: false
          });
        }
      }

      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    setError(null);
    try {
      // Delete user departments links
      await supabase.from('user_departments').delete().eq('user_id', id);
      
      // Delete user record
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;

      await fetchUsers();
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, [fetchUsers]);

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, [fetchUsers, fetchDepartments]);

  return {
    users,
    departments,
    loading,
    error,
    fetchUsers,
    fetchDepartments,
    createUser,
    updateUser,
    deleteUser
  };
}
