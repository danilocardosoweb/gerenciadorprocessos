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
    try {
      const { data, error } = await supabase.from('process_items').select('*');
      
      if (error) {
        console.error('❌ Error fetching process items:', error);
        setItems([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('✅ No process items found in Supabase (database is empty)');
        setItems([]);
        return;
      }
      
      console.log('✅ Fetched process items from Supabase:', data);
      
      // Transform flat table into nested ProcessItem structure
      const allItems = data.map((item: any) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        type: item.type,
        parent_id: item.parent_id,
        content: item.content,
        items: [],
        updatedAt: new Date(item.created_at).toLocaleDateString('pt-BR'),
      }));

      const rootItems: ProcessItem[] = allItems.filter((item: any) => !item.parent_id);
      const childItems = allItems.filter((item: any) => item.parent_id);

      childItems.forEach((child: any) => {
        const parent = rootItems.find(p => p.id === child.parent_id);
        if (parent) {
          parent.items = parent.items || [];
          parent.items.push(child);
        }
      });

      setItems(rootItems);
    } catch (err) {
      console.error('❌ Exception fetching process items:', err);
      setItems([]);
    }
  };

  const fetchDocuments = async () => {
    try {
      const { data, error } = await supabase.from('documents').select('*').order('created_at', { ascending: false });
      if (error) {
        console.error('❌ Error fetching documents:', error);
        return;
      }
      
      const docs = (data || []).map(doc => ({
        id: doc.id,
        name: doc.name,
        type: doc.type,
        size: doc.size,
        uploadDate: doc.upload_date,
        expirationDate: doc.expiration_date,
        status: doc.status,
        visibility: doc.visibility || 'public',
        department: doc.department || undefined,
        specific_user_id: doc.specific_user_id || null,
        created_by: doc.created_by || null,
      }));
      
      console.log('✅ Fetched documents from Supabase:', docs);
      setDocuments(docs);
    } catch (err) {
      console.error('❌ Exception fetching documents:', err);
      setDocuments([]);
    }
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
    try {
      const { data, error } = await supabase.from('users').select('*');
      if (error) {
        console.error('❌ Error fetching users:', error);
        setUsers([]);
        return;
      }
      
      if (!data || data.length === 0) {
        console.log('✅ No users found in Supabase');
        setUsers([]);
        return;
      }
      
      console.log('✅ Fetched users from Supabase:', data);
      setUsers(data);
    } catch (err) {
      console.error('❌ Exception fetching users:', err);
      setUsers([]);
    }
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
