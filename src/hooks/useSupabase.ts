import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ProcessItem } from '../components/Dashboard';
import { DocumentItem } from '../components/DocumentManager';

// Helpers to transform data between local state formats and DB formats (if necessary)
// For process_items, note the DB schema is flat with parent_id. Our local state is nested (items inside folder).

export function useSupabase() {
  const [items, setItems] = useState<ProcessItem[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProcessItems = async () => {
    const { data, error } = await supabase.from('process_items').select('*');
    if (error) {
      console.error('Error fetching process items:', error);
      return;
    }
    
    // Transform flat table into nested ProcessItem structure
    const allItems = data.map(item => ({
      ...item,
      items: [],
      updatedAt: item.created_at, // Use created_at or formatted string
    }));

    const rootItems: ProcessItem[] = allItems.filter(item => !item.parent_id);
    const childItems = allItems.filter(item => item.parent_id);

    childItems.forEach(child => {
      const parent = rootItems.find(p => p.id === child.parent_id);
      if (parent) {
        parent.items.push(child);
      }
    });

    setItems(rootItems);
  };

  const fetchDocuments = async () => {
    const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }
    
    // Transform camelCase logic for the local state if needed (db uses snake_case, but we can map)
    const docs = data.map(doc => ({
      id: doc.id,
      name: doc.name,
      type: doc.type,
      size: doc.size,
      uploadDate: doc.upload_date,
      expirationDate: doc.expiration_date,
      status: doc.status
    }));
    
    setDocuments(docs);
  };

  const fetchRoles = async () => {
    const { data, error } = await supabase.from('roles').select('*');
    if (error) {
      console.error('Error fetching roles:', error);
      return;
    }
    setRoles(data);
  };

  const fetchUsers = async () => {
    const { data, error } = await supabase.from('app_users').select(`
      *,
      role:roles(name)
    `);
    if (error) {
      console.error('Error fetching users:', error);
      return;
    }
    setUsers(data);
  };

  const loadAll = async () => {
    setLoading(true);
    await Promise.all([
      fetchProcessItems(),
      fetchDocuments(),
      fetchRoles(),
      fetchUsers()
    ]);
    setLoading(false);
  };

  useEffect(() => {
    loadAll();
  }, []);

  return {
    items,
    setItems,
    documents,
    setDocuments,
    roles,
    setRoles,
    users,
    setUsers,
    loading,
    refreshData: loadAll,
    fetchProcessItems,
    fetchDocuments,
    fetchRoles,
    fetchUsers
  };
}
