import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import jwt_decode from "jwt-decode";
import Swal from "sweetalert2";
import Cookies from "js-cookie";

interface TokenPayload {
  sub: {
    username: string;
    user_id: number;
    role: string;
  };
}


function NavBar() {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [username, setUsername] = useState("");
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    const token = Cookies.get('access_token_cookie');

    if (!token) {
      router.push("/");
    } else {
      try {
        const decodedToken = jwt_decode<TokenPayload>(token);
        const decodedUsername = decodedToken.sub.username;
        const decodedRole = decodedToken.sub.role;
        setUsername(decodedUsername);
        setUserRole(decodedRole); 
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  const handleLogout = () => {
  
    Swal.fire({
      title: "Confirm Logout",
      text: "Are you sure you want to sign out?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Sign Out",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        // Eliminar las cookies de sesión
        document.cookie =
          "access_token_cookie=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
        router.push("/");
      }
    });
  };

  function handleToggleDropdown() {
    setDropdownOpen(!dropdownOpen);
  }

  const handleProfileClick = () => {
    router.push(`/profile/${encodeURIComponent(username)}`);
  };

  return (
    <div className="d-flex justify-content-end pt-3 pr-3">
      <Dropdown>
        <Dropdown.Toggle
          variant="link"
          id="dropdownUser2"
          className="d-flex align-items-center text-decoration-none"
          style={{ padding: 0 }}
          onClick={handleToggleDropdown}
        >
          <img
            src="https://www.kindpng.com/picc/m/24-248253_user-profile-default-image-png-clipart-png-download.png"
            alt=""
            width="32"
            height="32"
            className="rounded-circle me-2"
          />
          <strong>{username}</strong>
        </Dropdown.Toggle>
        <Dropdown.Menu className="text-small shadow" show={dropdownOpen}>
          {userRole === "admin" ? (
            <Dropdown.Item href="/NewUser">New User</Dropdown.Item>
          ) : (
            <Dropdown.Item disabled href="#">
              New User
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={handleProfileClick}>Profile</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Item onClick={handleLogout}>Sign out</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </div>
  );
}

export default NavBar;
