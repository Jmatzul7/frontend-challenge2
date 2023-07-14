import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';
import 'bootstrap/dist/css/bootstrap.min.css';
import Swal from 'sweetalert2';

const url = "http://localhost:5000";
type User = {
  full_name: string;
  role: string;
  username: string;
};

interface UserResponse  {
  users: User[];
};

const Users = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${url}/getAllUsers`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Error getting users');
        }

        const data: UserResponse = await response.json();
        setUsers(data.users);
      } catch (error) {
        console.error(error);
      }
    };

    fetchUsers();
  }, []);

  const handleDeleteUser = async (username: string) => {
    Swal.fire({
      title: 'You are sure?',
      text: 'This action will delete the user permanently',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
         
          const response = await fetch(`${url}/deleteUser/${username}`, {
            method: 'DELETE',
            credentials: 'include',
          });
  
          if (!response.ok) {
            throw new Error('Failed to delete user');
          }
  
         
          Swal.fire({
            icon: 'success',
            title: 'User Deleted',
            text: 'The user has been deleted successfully',
          }).then(() => {
            
          });
          window.location.reload();
        } catch (error) {
          console.error(error);
        }
      }
    });
  };
  

  return (
    <div className='container-fluid h-100'>
      <div className='row h-100'>
      <div className="col-12 col-md-2 h-100" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <NavBar />
          <h1>Users</h1>
          <table className='table table-striped table-bordered'>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Role</th>
                <th>Username</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.username}>
                  <td>{user.full_name}</td>
                  <td>{user.role}</td>
                  <td>{user.username}</td>
                  <td>
                    <button className='btn btn-danger' onClick={() => handleDeleteUser(user.username)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Users;
