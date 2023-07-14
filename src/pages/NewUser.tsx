import React, { useState, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';
import Swal from 'sweetalert2';

const url = "http://localhost:5000";

interface User {
  username: string;
  password: string;
  full_name: string;
  role: string;
};

const NewUser = () => {
  const router = useRouter();

  const [userData, setUserData] = useState<User>({
    username: '',
    password: '',
    full_name: '',
    role: '',
  });

  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    setUserData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    try {
      const response = await fetch(`${url}/newUser`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', 
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'User created successfully',
          text: 'The user has been created successfully',
        });
        router.push('/dashboard');
      } else {
        const data = await response.json();
      const error = data.error;
        Swal.fire({
          icon: 'error',
          title: 'Error creating user',
          text: error,
        });
      }
    } catch (error) {
      console.error('HTTP request failed', error);
    }
    
    setUserData({
      username: '',
      password: '',
      full_name: '',
      role: '',
    });
  };

  return (
    <div className="container-fluid h-100">
      <div className='row h-100'>
      <div className="col-12 col-md-2" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <NavBar></NavBar>

          <div className="card col-6 mx-auto">
            <div className="card-header">
              <h1>Create New User</h1>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="full_name" className="form-label">
                    Full Name:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="full_name"
                    name="full_name"
                    value={userData.full_name}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="username" className="form-label">
                    Username:
                  </label>
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={userData.username}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="password" className="form-label">
                    Password:
                  </label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    value={userData.password}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="mb-3">
                  <label htmlFor="role" className="form-label">
                    Role:
                  </label>
                  <select
                    className="form-control"
                    id="role"
                    name="role"
                    value={userData.role}
                    onChange={handleInputChange}
                  >
                    <option value="">Select Role</option>
                    <option value="admin">Encargado</option>
                    <option value="employee">Empleado</option>
                  </select>
                </div>

                <button type="submit" className="btn btn-primary">
                  Create User
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewUser;
