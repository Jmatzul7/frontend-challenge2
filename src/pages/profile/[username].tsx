import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import UserProfile from '../profile';

interface User{
  username:string
}

const UserProfilePage = () => {
  const router = useRouter();
  const { username } = router.query;
  const [userExists, setUserExists] = useState(false);

  const url = "http://localhost:5000";

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        if (!username || typeof username !== 'string') {
          setUserExists(false);

          return;
        }

        const response = await fetch(`${url}/getUser/${username}`,{
          credentials: 'include'
        });
        const data = await response.json();

        if (response.ok) {
          setUserExists(true);
        } else {
          console.log(data)
          setUserExists(false);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUserDetails();
  }, [username]);

  if (!username || typeof username !== 'string') {
    return <div>Error: Username not provided</div>;
  }

  if (!userExists) {
    return <div>User not found</div>;
  }
  return <UserProfile username={username} />;
};

export default UserProfilePage;
