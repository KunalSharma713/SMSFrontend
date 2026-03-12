import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../context/ConfirmationContext';
import Dropdown from '../components/Dropdown';
import DataTable from '../components/DataTable';
import PersonAddAltOutlinedIcon from '@mui/icons-material/PersonAddAltOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

const ROLES = ['ADVISOR', 'MANAGEMENT'];
const ROLE_LABELS = { ADVISOR: 'Advisor', MANAGEMENT: 'Management' };

export default function Users() {
  const { toast } = useNotification();
  const { confirmDialog } = useConfirmation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'ADVISOR', status: 'ACTIVE' });
  const [formError, setFormError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/users', { params: { page, limit } });
      setUsers(res.data.data || []);
      setTotal(res.data.total ?? 0);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchUsers();
  }, [page]);

  const openCreate = () => {
    setForm({ name: '', email: '', password: '', role: 'ADVISOR', status: 'ACTIVE' });
    setFormError('');
    setFieldErrors({});
    setModal('create');
  };

  const openEdit = (u) => {
    setForm({
      name: u.name,
      email: u.email,
      password: '',
      role: u.role,
      status: u.status || 'ACTIVE'
    });
    setFormError('');
    setFieldErrors({});
    setModal(u._id);
  };

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email';
    if (modal === 'create' && !form.password.trim()) next.password = 'Password is required';
    else if (modal === 'create' && form.password.length > 0 && form.password.length < 6) next.password = 'Password must be at least 6 characters';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }));
    if (fieldErrors[field]) setFieldErrors((e) => ({ ...e, [field]: '' }));
    if (formError) setFormError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    if (!validate()) return;
    const payload = { ...form };
    if (modal !== 'create' && !payload.password.trim()) delete payload.password;
    try {
      if (modal === 'create') {
        await axiosInstance.post('/users', payload);
      } else {
        if (form.password.trim()) {
          await axiosInstance.put(`/users/${modal}`, payload);
        } else {
          await axiosInstance.put(`/users/${modal}`, { name: form.name, role: form.role, status: form.status });
        }
      }
      setModal(null);
      fetchUsers();
      toast.success(modal === 'create' ? 'User created.' : 'User updated.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Request failed';
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete user',
      message: 'Delete this user? This cannot be undone.',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      setModal(null);
      fetchUsers();
      toast.success('User deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" aria-hidden />
        <span style={{ marginLeft: '0.75rem' }}>Loading users…</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="app-alert app-alert-error" role="alert">
        {error}
      </div>
    );
  }

  return (
    <>
      <header className="page-header">
        <h1 className="page-heading">Users</h1>
        <div className="page-actions">
          <button type="button" className="btn btn-primary-app" onClick={openCreate}>
            <PersonAddAltOutlinedIcon fontSize="small" />
            Add user
          </button>
        </div>
      </header>

      <div className="section-card" style={{ padding: 0, overflow: 'hidden' }}>
        <DataTable
          rows={users}
          getRowKey={(u) => u._id}
          pagination={{ page, limit, total, onPageChange: setPage }}
          empty={{ message: 'No users found.' }}
          columns={[
            { key: 'name', header: 'Name', cell: (u) => u.name },
            { key: 'email', header: 'Email', cell: (u) => u.email },
            { key: 'role', header: 'Role', cell: (u) => u.role },
            {
              key: 'status',
              header: 'Status',
              cell: (u) => <span className={`badge badge-${u.status === 'ACTIVE' ? 'active' : 'inactive'}`}>{u.status}</span>
            },
            {
              key: 'actions',
              header: 'Actions',
              cell: (u) => (
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {u.role !== 'ADMIN' && (
                    <>
                      <button type="button" className="btn btn-ghost-app" onClick={() => openEdit(u)}>
                        <EditOutlinedIcon fontSize="small" />
                      </button>
                      <button type="button" className="btn btn-danger-app" onClick={() => handleDelete(u._id)}>
                        <DeleteOutlineOutlinedIcon fontSize="small" />
                      </button>
                    </>
                  )}
                  {u.role === 'ADMIN' && <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>—</span>}
                </div>
              )
            }
          ]}
        />
      </div>

      {modal && (
        <div className="app-modal-overlay" onClick={() => setModal(null)} role="dialog" aria-modal="true" aria-labelledby="user-modal-title">
          <div className="app-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="user-modal-title" className="app-modal-title">
              {modal === 'create' ? 'New user' : 'Edit user'}
            </h2>
            {formError && (
              <div className="login-alert login-alert-error" role="alert">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className={`login-field required ${fieldErrors.name ? 'login-field-error' : ''}`}>
                <label htmlFor="user-name" className="login-label">Name</label>
                <input
                  id="user-name"
                  type="text"
                  className="login-input"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Full name"
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <span className="login-field-message" role="alert">{fieldErrors.name}</span>}
              </div>
              <div className={`login-field required ${fieldErrors.email ? 'login-field-error' : ''}`}>
                <label htmlFor="user-email" className="login-label">Email</label>
                <input
                  id="user-email"
                  type="email"
                  className="login-input"
                  value={form.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="you@institute.com"
                  disabled={modal !== 'create'}
                  aria-invalid={!!fieldErrors.email}
                />
                {fieldErrors.email && <span className="login-field-message" role="alert">{fieldErrors.email}</span>}
              </div>
              <div className={`login-field ${modal === 'create' ? 'required' : ''} ${fieldErrors.password ? 'login-field-error' : ''}`}>
                <label htmlFor="user-password" className="login-label">Password {modal !== 'create' && '(leave blank to keep)'}</label>
                <input
                  id="user-password"
                  type="password"
                  className="login-input"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  minLength={6}
                  placeholder={modal !== 'create' ? '••••••••' : ''}
                  aria-invalid={!!fieldErrors.password}
                />
                {fieldErrors.password && <span className="login-field-message" role="alert">{fieldErrors.password}</span>}
              </div>
              <Dropdown
                id="user-role"
                label="Role"
                value={form.role}
                onChange={(e) => handleChange('role', e.target.value)}
                options={ROLES.map((r) => ({ value: r, label: ROLE_LABELS[r] ?? r }))}
              />
              <Dropdown
                id="user-status"
                label="Status"
                value={form.status}
                onChange={(e) => handleChange('status', e.target.value)}
                options={[
                  { value: 'ACTIVE', label: 'Active' },
                  { value: 'INACTIVE', label: 'Inactive' }
                ]}
              />
              <div className="app-form-actions">
                <button type="submit" className="btn btn-primary-app">Save</button>
                <button type="button" className="btn btn-ghost-app" onClick={() => setModal(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
