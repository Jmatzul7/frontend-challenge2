import { useState } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';

interface LoginFormProps {
  onLogin: (username: string, token: string) => void;
}

const LoginForm = ({ onLogin }: LoginFormProps) => {
  const router = useRouter();
  const url = "http://localhost:5000";

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      
      const response = await fetch(`${url}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        
        const data = await response.json();
        const token = data.access_token;
  
        document.cookie = `access_token_cookie=${token}; path=/;`;
 
  
        setUsername('');
        setPassword('');

        // Llamar a la función onLogin para manejar el inicio de sesión
        onLogin(username, token);

        const MySwal = withReactContent(Swal);
        MySwal.fire({
          title: 'Login successful',
          text: 'You have successfully logged in.',
          icon: 'success',
          confirmButtonText: 'Ok',
          
        }).then((result) => {
          if (result.isConfirmed) {
            
            router.push('/dashboard');
          }
        });
        
      } else if (response.status === 400) {
       
        Swal.fire({
          title: 'Error',
          text: 'Please enter the username and password.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      } else if (response.status === 401) {
        
        Swal.fire({
          title: 'Error',
          text: 'Username or password incorrect.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      } else if (response.status === 500) {
        // Error en la base de datos
        Swal.fire({
          title: 'Error',
          text: 'An error has occurred. Please try again later.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      } else {
        // Otro tipo de error
        console.error('Request Failed:', response.status);
      }
    } catch (error) {
      console.error('Request Failed:', error);
    }
  };

  return (
    <div className="container">
      <br />
      <br />
      <div className="col-12">
        <div className="row justify-content-center">
          <div className="col-md-4">
            <div className="card text-white bg-dark">
              <div className="card-header">
                <strong>Log in</strong>
              </div>
              <br />
              <div className="card-body">
                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label>Username:</label>
                    <input
                      type="text"
                      className="form-control"
                      id="username"
                      placeholder="Enter your username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Password:</label>
                    <input
                      type="password"
                      className="form-control"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                    />
                  </div>
                  <button type="submit" className="btn btn-primary">
                  Log in
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        body{
          background:#001730!important;
        }
      `}</style>
    </div>
  );
};

export default LoginForm;
