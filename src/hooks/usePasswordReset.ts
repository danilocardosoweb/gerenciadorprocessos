import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function usePasswordReset() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const sendResetEmail = async (email: string) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;

      setSuccess(true);
      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao enviar email de recuperação');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      return true;
    } catch (err: any) {
      setError(err.message || 'Erro ao redefinir senha');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    sendResetEmail,
    resetPassword,
    loading,
    error,
    success,
  };
}
