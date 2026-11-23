import { useEffect } from 'react';

import { useNotificationStore } from '@/store/notificationStore';

export const Toast = () => {
  const message = useNotificationStore((state) => state.message);
  const visible = useNotificationStore((state) => state.visible);
  const hideNotification = useNotificationStore(
    (state) => state.hideNotification
  );

  useEffect(() => {
    if (!visible) return;

    const timeout = setTimeout(() => {
      hideNotification();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [visible, message, hideNotification]);

  if (!visible) return null;

  return (
    <div
      role="alert"
      className="fixed right-4 top-4 z-50 rounded-lg bg-red-600 px-5 py-3 text-white shadow-lg"
    >
      {message}
    </div>
  );
};