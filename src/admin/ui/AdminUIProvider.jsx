import React from 'react';
import { ToastProvider } from './ToastContext';
import { ConfirmProvider } from './ConfirmContext';

export { useToast } from './ToastContext';
export { useConfirm } from './ConfirmContext';

export default function AdminUIProvider({ children }) {
  return (
    <ToastProvider>
      <ConfirmProvider>{children}</ConfirmProvider>
    </ToastProvider>
  );
}
