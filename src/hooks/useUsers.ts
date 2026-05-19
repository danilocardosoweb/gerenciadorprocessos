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

// Local storage keys
const USERS_STORAGE_KEY = 'tecno_users';
const DEPTS_STORAGE_KEY = 'tecno_departments';

// Default departments
const DEFAULT_DEPARTMENTS: Department[] = [
  { id: '1', name: 'Diretoria', description: 'Gestão e direção estratégica', color: '#8b5cf6', icon: 'crown' },
  { id: '2', name: 'Comercial', description: 'Vendas e atendimento ao cliente', color: '#10b981', icon: 'shopping-cart' },
  { id: '3', name: 'Qualidade', description: 'Controle de qualidade e certificações', color: '#f59e0b', icon: 'shield-check' },
  { id: '4', name: 'PCP', description: 'Planejamento e Controle da Produção', color: '#3b82f6', icon: 'calendar-clock' },
  { id: '5', name: 'Produção', description: 'Operações de fabricação', color: '#ef4444', icon: 'factory' },
  { id: '6', name: 'Manutenção', description: 'Manutenção de equipamentos', color: '#6b7280', icon: 'wrench' },
  { id: '7', name: 'Embalagem', description: 'Processos de embalagem', color: '#84cc16', icon: 'package' },
  { id: '8', name: 'Expedição', description: 'Logística de saída', color: '#06b6d4', icon: 'truck' },
  { id: '9', name: 'Alúnica', description: 'Setor de alumínio', color: '#a855f7', icon: 'metal' },
  { id: '10', name: 'Zincolor', description: 'Setor de zinco colorido', color: '#f97316', icon: 'palette' },
  { id: '11', name: 'Fixxar', description: 'Setor Fixxar', color: '#ec4899', icon: 'screwdriver' },
];

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const savedUsers = localStorage.getItem(USERS_STORAGE_KEY);
    const savedDepts = localStorage.getItem(DEPTS_STORAGE_KEY);
    
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Default users
      setUsers([
        { id: '1', name: 'Danilo Cardoso', email: 'pcp@tecnoperfilalumino.com.br', role: 'Administrador', department: 'PCP', status: 'Ativo' },
        { id: '2', name: 'João Silva', email: 'joao.silva@exemplo.com', role: 'Editor', department: 'Produção', status: 'Ativo' },
        { id: '3', name: 'Maria Souza', email: 'maria.souza@exemplo.com', role: 'Editor', department: 'Qualidade', status: 'Ativo' },
      ]);
    }
    
    if (savedDepts) {
      setDepartments(JSON.parse(savedDepts));
    } else {
      setDepartments(DEFAULT_DEPARTMENTS);
      localStorage.setItem(DEPTS_STORAGE_KEY, JSON.stringify(DEFAULT_DEPARTMENTS));
    }
  }, []);

  // Save to localStorage when users change
  useEffect(() => {
    if (users.length > 0) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    }
  }, [users]);

  // Save departments to localStorage
  useEffect(() => {
    if (departments.length > 0) {
      localStorage.setItem(DEPTS_STORAGE_KEY, JSON.stringify(departments));
    }
  }, [departments]);

  // Create user - saves to localStorage
  const createUser = useCallback(async (userData: Omit<User, 'id' | 'created_at'> & { password?: string }) => {
    setError(null);
    try {
      const newUser: User = {
        id: Date.now().toString(),
        name: userData.name,
        email: userData.email,
        role: userData.role,
        department: userData.department,
        status: userData.status,
        created_at: new Date().toISOString()
      };
      
      setUsers(prev => [...prev, newUser]);
      return { success: true };
    } catch (err: any) {
      console.error('Error creating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Update user
  const updateUser = useCallback(async (id: string, userData: Partial<User> & { password?: string }) => {
    setError(null);
    try {
      setUsers(prev => prev.map(u => 
        u.id === id ? { 
          ...u, 
          name: userData.name || u.name,
          email: userData.email || u.email,
          role: userData.role || u.role,
          department: userData.department !== undefined ? userData.department : u.department,
          status: userData.status || u.status
        } : u
      ));
      return { success: true };
    } catch (err: any) {
      console.error('Error updating user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Delete user
  const deleteUser = useCallback(async (id: string) => {
    setError(null);
    try {
      setUsers(prev => prev.filter(u => u.id !== id));
      return { success: true };
    } catch (err: any) {
      console.error('Error deleting user:', err);
      setError(err.message);
      return { success: false, error: err.message };
    }
  }, []);

  // Add department
  const addDepartment = useCallback(async (dept: Omit<Department, 'id'>) => {
    const newDept: Department = {
      ...dept,
      id: Date.now().toString()
    };
    setDepartments(prev => [...prev, newDept]);
    return { success: true };
  }, []);

  // Update department
  const updateDepartment = useCallback(async (id: string, dept: Partial<Department>) => {
    setDepartments(prev => prev.map(d => d.id === id ? { ...d, ...dept } : d));
    return { success: true };
  }, []);

  // Delete department
  const deleteDepartment = useCallback(async (id: string) => {
    setDepartments(prev => prev.filter(d => d.id !== id));
    return { success: true };
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
    deleteDepartment
  };
}
