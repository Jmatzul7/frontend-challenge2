
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

// Componentes
import LoginForm from './LoginForm';
import Dashboard from './dashboard';
import Cookies from 'js-cookie';

function Home() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
      const token = Cookies.get('access_token_cookie');
      setIsAuthenticated(!!token);
    }, []);
    
  const router = useRouter();

    
  // Función para validar las credenciales y redirigir al dashboard
  const handleLogin = (username: string, password: string) => {
  if (username === username && password === password) {
    setIsAuthenticated(true);
    router.push('/dashboard');
  }
  };

  return (
    <div>
      {isAuthenticated ? (
        <Dashboard />
      ) : (
        <LoginForm onLogin={handleLogin} />
      )}
    </div>
  );
}

export default Home



