import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Header = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-content">
        <h1>Best Hotels Search App</h1>
        {user && (
          <div className="header-actions">
            <span style={{ marginRight: '15px', fontSize: '14px' }}>
              {user.email}
            </span>
            <button className="btn btn-outline" onClick={handleSignOut}>
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;