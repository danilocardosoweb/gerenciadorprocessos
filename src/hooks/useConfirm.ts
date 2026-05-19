import { useState, useCallback } from 'react';

interface ConfirmOptions {
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

export function useConfirm() {
  const [state, setState] = useState<ConfirmState>({
    isOpen: false,
    message: '',
    onConfirm: () => {},
    title: 'TEM CERTEZA?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'danger'
  });

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setState({
        ...options,
        isOpen: true,
        onConfirm: () => {
          resolve(true);
          closeConfirm();
        },
        onCancel: () => {
          resolve(false);
          closeConfirm();
        }
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const handleConfirm = useCallback(() => {
    state.onConfirm();
  }, [state.onConfirm]);

  const handleCancel = useCallback(() => {
    state.onCancel?.();
    closeConfirm();
  }, [state.onCancel, closeConfirm]);

  return {
    confirm,
    confirmState: state,
    closeConfirm,
    handleConfirm,
    handleCancel
  };
}
