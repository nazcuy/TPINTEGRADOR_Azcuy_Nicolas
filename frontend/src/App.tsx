import { useEffect } from 'react';

import { AppRouter } from '@/routes/AppRouter';
import { useAuthStore } from '@/features/auth';
import { useThemeStore } from '@/store/themeStore';
import { setupInterceptors } from '@/shared/api/setupInterceptors';
import { Toast } from '@/shared/components/Toast';

function App() {
  const inicializado = useAuthStore((state) => state.inicializado);
  const inicializar = useAuthStore((state) => state.inicializar);

  const darkMode = useThemeStore((state) => state.darkMode);

  useEffect(() => {
    setupInterceptors();
    void inicializar();
  }, [inicializar]);

  return (
    <div className={darkMode ? 'dark min-h-screen bg-gray-900 text-white' : 'min-h-screen bg-white text-gray-900'}>
      {!inicializado ? (
        <main>Verificando sesión...</main>
      ) : (
        <AppRouter />
      )}

      <Toast />
    </div>
  );
}

export default App;
