import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Sidebar from '../components/Sidebar';
import NavBar from '../components/Navbar';
import Swal from 'sweetalert2';

interface RouteParams {
  username: string;
}

interface UserProfileProps {
  username: string;
}

const url = "http://localhost:5000";

const UserProfilePage = ({  }: UserProfileProps) => {
  const router = useRouter();
  const { username } = router.query as unknown as RouteParams;
  const [userData, setUserData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newRole, setNewRole] = useState('');

  if (!username) {
    return <div>Error: Username not provided</div>;
  }

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`${url}/getUser/${username}`, {
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
          setUserData(data.usuario);
        } else {
          setError(data.error);
        }
      } catch (error) {
        console.error(error);
        setError('Error getting user data');
      }
    };

    fetchUserProfile();
  }, [username]);

  const handleUpdateProfile = () => {
    setShowModal(true);
    setNewUsername(userData.username);
    setNewFullName(userData.full_name);
    setNewRole(userData.role)
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };

  const handleFormSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedProfile = {
      current_password: currentPassword,
      new_username: newUsername,
      new_password: newPassword,
      new_full_name: newFullName,
      new_role: newRole
    };


    
    try {
      const response = await fetch(`${url}/updateUser/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedProfile),
        credentials: 'include'
      });
  
      if (response.ok) {
        
+        Swal.fire({
          icon: 'success',
          title: 'Profile updated successfully',
        });
        // Eliminar las cookies de sesión
    document.cookie =
    "access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
  
  router.push('/')
      } else {
        
        const data = await response.json();
        const error = data.error;
        Swal.fire({
          icon: 'error',
          title: 'Error updating profile',
          text: error,
        });
      }
    } catch (error) {
      console.error('Request Failed:', error);
    }
    console.log(updatedProfile)
    setShowModal(false);
  };

  const renderProfileCard = () => {
    if (userData) {
      return (
        <div className="container">
          <div className="row">
              <div className="col-5">
                <div className="profile-card">
                  <div className="profile-image">
                    <img src="https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png" alt="" />
                  </div>
                  <br />
                    <hr />
                  <div className="profile-details col-md16">
                    
                    <h2>{userData.full_name}</h2>
                  </div>
                </div>
              </div>
              <div className="col-5">
                <div className="profile-card">
                  <div className="profile-details">
                    <p>
                      <strong>Username:</strong> {userData.username}
                    </p>
                    <p>
                      <strong>Role:</strong> {userData.role}
                    </p>
                    <div className="profile-actions">
                      <button onClick={handleUpdateProfile}>Update Profile</button>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container-fluid h-100">
      <div className="row h-100">
      <div className="col-12 col-md-2" style={{ background: '#212529' }}>
          <Sidebar />
        </div>
        <div className="col-12 col-md-10">
          <div className="container">
            <NavBar />
            <div className="profile-container">
              <h1>Profile</h1>
              {renderProfileCard()}
              {error && <div>Error: {error}</div>}
            </div>
          </div>
        </div>
      </div>

      {showModal && (
    <div className="modal">
      <div className="modal-content">
        <span className="close" onClick={handleCloseModal}>&times;</span>
        <h2>Update Profile</h2>
        <form onSubmit={handleFormSubmit}>

        <div className="form-group">
            <label htmlFor="newFullName">New Full Name</label>
            <input className='form-control' type="text" id="newFullName" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
          </div>

        <div className="form-group">
            <label htmlFor="newUsername">New Username</label>
            <input className='form-control' type="text" id="newUsername" value={newUsername} onChange={(e) => setNewUsername(e.target.value)} />
          </div>

          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input className='form-control' type="password" id="currentPassword" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input className='form-control' type="password" id="newPassword" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          
          <div className="form-group d-none">
            <label htmlFor="newRole">New Role</label>
            <input className='form-control'  type="text" id="newRole" value={newRole} onChange={(e) => setNewRole(e.target.value)} />
          </div>
          <button type="submit">Update</button>
        </form>
      </div>
    </div>
  )}
    </div>
  );
};

export default UserProfilePage;
