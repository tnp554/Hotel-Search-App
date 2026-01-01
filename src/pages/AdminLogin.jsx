import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (formData.email === 'admin@support.com' && formData.password === 'Hello@123') {
      localStorage.setItem('adminSession', JSON.stringify({
        email: formData.email,
        role: 'admin',
        loginTime: new Date().toISOString()
      }));
      
      navigate('/admin/dashboard');
    } else {
      setError('Invalid admin credentials');
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2>Admin Login</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '20px' }}>
        Administrative Access Only
      </p>
      
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="email">Admin Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter admin mail"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">Admin Password</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Enter admin password"
            required
          />
        </div>

        <button 
          type="submit" 
          className="btn btn-primary" 
          style={{ width: '100%' }}
          disabled={loading}
        >
          {loading ? 'Signing in...' : 'Admin Sign In'}
        </button>
      </form>

      <div className="form-link">
        <Link to="/login">← Back to User Login</Link>
      </div>
    </div>
  );
};

export default AdminLogin;