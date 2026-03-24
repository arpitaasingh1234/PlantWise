import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <Link to="/" className="navbar-brand">
          PlantWise
        </Link>
        
        <ul className="navbar-nav">
          <li>
            <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" className={location.pathname === '/dashboard' ? 'active' : ''}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/my-plants" className={location.pathname === '/my-plants' ? 'active' : ''}>
              My Plants
            </Link>
          </li>
          <li>
            <Link to="/community" className={location.pathname === '/community' ? 'active' : ''}>
              Community
            </Link>
          </li>
          <li>
            <Link to="/login" className={location.pathname === '/login' ? 'active' : ''}>
              Login
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default Navigation;
