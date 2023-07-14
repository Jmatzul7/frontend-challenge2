import { useRouter } from 'next/router';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import jwt_decode from "jwt-decode";
import styles from '../../styles/siderbar.module.css';
import Cookies from 'js-cookie';

interface TokenPayload {
  sub: {
    role: string;
  };
}

interface NavLinkProps {
  href: string;
  label: string;
}

function NavLink({ href, label }: NavLinkProps) {
  const  router = useRouter();
  const isActive = new RegExp(`^${href}`).test(router.asPath);

  return (
    <li className={`nav-item ${isActive ? 'active' : ''}`}>
      <Link href={href} legacyBehavior>
        <a className={`nav-link link-light ${isActive ? 'active-link' : ''}`}>
          {label}
        </a>
      </Link>
    </li>
  );
}

function Sidebar() {
  const router = useRouter();
  const [userRole, setUserRole] = useState("");
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = Cookies.get('access_token_cookie');
    
    if (!token) {
      router.push("/");
    } else {
      try {
        const decodedToken = jwt_decode<TokenPayload>(token);
        const decodedRole = decodedToken.sub.role;
        setUserRole(decodedRole);
      } catch {
        // Handle decoding error
      }
    }
  }, [router]);

  useEffect(() => {
    function handleResize() {
      if (sidebarRef.current) {
        sidebarRef.current.style.height = 'auto';
        sidebarRef.current.style.height = `${sidebarRef.current.scrollHeight}px`;
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className={`col-2  ${styles.sidebar}`}>
      <div ref={sidebarRef} className={`d-flex flex-column flex-shrink-0 post p-3 pos  ${styles.sidebarContent}`}>
        <a href="/" className="d-flex align-items-center mb-3 mb-md-0 me-md-auto link-dark text-decoration-none">
          <span className="fs-4 text-white">Connect <br />Plus</span>
        </a>
        <hr className="sidebar-divider" />
        <ul className="nav nav-pills flex-column mb-auto">
          <NavLink href="/dashboard" label="Home" />
          <NavLink href="/customers" label="Customers" />
          <NavLink href="/Graphics" label="Graphics" />
          <NavLink href="/sales" label="Sales" />
          <li className={`nav-item ${router.pathname === '/users' ? 'active' : ''}`}>
            {userRole === "admin" ? (
              <Link href="/users" legacyBehavior>
                <a className={`nav-link link-light`}>
                  Users
                </a>
              </Link>
            ) : (
              <a href="/Users" className="nav-link link-light disabled" aria-disabled="true">
                Users
              </a>
            )}
          </li>
        </ul>
      </div>


      
      <style jsx>{`
        .pos {
          position: fixed;
        }
        @media (max-width: 780px) {
          .pos {
            position: relative;
            top: 0;
            height: 300px;
            z-index: 999;
          }
          .pos.${styles.sidebar} {
            position: relative;
          }
        }
      `}</style>
    </div>
  );
}

export default Sidebar;
