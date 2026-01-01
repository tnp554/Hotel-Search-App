import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabaseAdmin } from '../services/supabase';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    const adminSession = localStorage.getItem('adminSession');
    if (!adminSession) {
      navigate('/admin/login');
      return;
    }

    fetchUsers();
  }, [navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError('');

      console.log('Fetching users with admin client...');

      const { data: { users: allUsers }, error: fetchError } = await supabaseAdmin.auth.admin.listUsers();

      if (fetchError) {
        console.error('Fetch error:', fetchError);
        throw fetchError;
      }

      const sortedUsers = (allUsers || []).sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );

      setUsers(sortedUsers);
      console.log(`Successfully fetched ${sortedUsers.length} users`);
    } catch (err) {
      console.error('Error fetching users:', err);
      
      let errorMessage = 'Failed to fetch users. ';
      
      if (err.message?.includes('service_role')) {
        errorMessage += 'Service role key is missing or invalid. Please add VITE_SUPABASE_SERVICE_ROLE_KEY to your .env file.';
      } else if (err.message?.includes('JWT')) {
        errorMessage += 'Authentication error. Check your Supabase credentials.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (deleteConfirm !== userId) {
      setDeleteConfirm(userId);
      setTimeout(() => setDeleteConfirm(null), 3000);
      return;
    }

    try {
      setError('');
      setSuccessMessage('');

      console.log('Deleting user:', userId, userEmail);

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw deleteError;
      }

      console.log('User deleted successfully');
      setSuccessMessage(`User ${userEmail} deleted successfully`);
      
      await fetchUsers();
      setDeleteConfirm(null);

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('Error deleting user:', err);
      
      let errorMessage = 'Failed to delete user. ';
      
      if (err.message?.includes('service_role')) {
        errorMessage += 'Service role key is required for user deletion.';
      } else {
        errorMessage += err.message || 'Unknown error occurred.';
      }
      
      setError(errorMessage);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminSession');
    navigate('/admin/login');
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.id?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div>
      <div className="admin-header">
        <div className="admin-header-content">
          <div>
            <h4>Admin Dashboard</h4>
            <p style={{ margin: '5px 0 0 0', fontSize: '14px', opacity: 0.9 }}>
              admin@support.com
            </p>
          </div>
          <button className="btn btn-outline" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '30px' }}>
        <div className="admin-panel">
          <div className="admin-panel-header">
            <div>
              <h2>User Management</h2>
              <p style={{ color: '#666', marginTop: '5px', fontSize: '14px' }}>
                Total Users: <strong>{users.length}</strong>
              </p>
            </div>
            <button className="btn btn-secondary" onClick={fetchUsers} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              <strong>Error:</strong> {error}
              <details style={{ marginTop: '10px', fontSize: '12px' }}>
                <summary style={{ cursor: 'pointer', color: '#999' }}>
                  Need help? Click here
                </summary>
                <div style={{ marginTop: '10px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                  <p><strong>To enable admin features:</strong></p>
                  <ol style={{ paddingLeft: '20px', marginTop: '5px' }}>
                    <li>Go to Supabase Dashboard → Settings → API</li>
                    <li>Copy the <code>service_role</code> key</li>
                    <li>Add to .env: <code>VITE_SUPABASE_SERVICE_ROLE_KEY=your_key</code></li>
                    <li>Restart the dev server</li>
                  </ol>
                </div>
              </details>
            </div>
          )}

          {successMessage && (
            <div className="alert alert-success" style={{ marginBottom: '20px' }}>
              <strong>Success:</strong> {successMessage}
            </div>
          )}

          <div className="search-box">
            <input
              type="text"
              placeholder="Search by email or user ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 15px',
                border: '2px solid #e0e0e0',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading users...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"></div>
              <h3>No users found</h3>
              <p>
                {searchTerm 
                  ? 'Try adjusting your search' 
                  : 'No registered users yet. Users who sign up will appear here.'}
              </p>
            </div>
          ) : (
            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>User ID</th>
                    <th>Created At</th>
                    <th>Last Sign In</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.id}>
                      <td>
                        <strong>{user.email}</strong>
                      </td>
                      <td>
                        <code style={{ 
                          fontSize: '12px', 
                          background: '#f5f5f5', 
                          padding: '2px 6px', 
                          borderRadius: '4px' 
                        }}>
                          {user.id.substring(0, 8)}...
                        </code>
                      </td>
                      <td>{formatDate(user.created_at)}</td>
                      <td>
                        {user.last_sign_in_at 
                          ? formatDate(user.last_sign_in_at)
                          : <span style={{ color: '#999' }}>Never</span>
                        }
                      </td>
                      <td>
                        <span className={`status-badge ${user.email_confirmed_at ? 'confirmed' : 'pending'}`}>
                          {user.email_confirmed_at ? '✓ Verified' : '⏳ Pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          className={`btn btn-danger btn-sm ${deleteConfirm === user.id ? 'confirm' : ''}`}
                          onClick={() => handleDeleteUser(user.id, user.email)}
                          title={deleteConfirm === user.id ? 'Click again to confirm deletion' : 'Delete user'}
                        >
                          {deleteConfirm === user.id ? 'Confirm?' : 'Delete'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && users.length > 0 && (
            <div style={{ 
              marginTop: '30px', 
              padding: '20px', 
              background: '#f9fafb', 
              borderRadius: '8px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px'
            }}>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Total Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#667eea', margin: 0 }}>
                  {users.length}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Verified Users</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#10b981', margin: 0 }}>
                  {users.filter(u => u.email_confirmed_at).length}
                </p>
              </div>
              <div>
                <p style={{ color: '#666', fontSize: '14px', marginBottom: '5px' }}>Pending Verification</p>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#f59e0b', margin: 0 }}>
                  {users.filter(u => !u.email_confirmed_at).length}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;