import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { useConfirmation } from '../context/ConfirmationContext';
import EmptyState from '../components/EmptyState';
import AddCircleOutlineOutlinedIcon from '@mui/icons-material/AddCircleOutlineOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineOutlinedIcon from '@mui/icons-material/DeleteOutlineOutlined';

export default function Programs() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const { confirmDialog } = useConfirmation();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', duration: '', fee: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');

  const isStudent = user?.role === 'STUDENT';
  const isAdmin = user?.role === 'ADMIN';

  const validate = () => {
    const next = {};
    if (!form.name.trim()) next.name = 'Program name is required';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const fetchPrograms = async () => {
    try {
      const res = await axiosInstance.get('/programs');
      setPrograms(res.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load programs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStudent) {
      const enrolledProgram = user?.studentId?.programId;
      setPrograms(enrolledProgram ? [enrolledProgram] : []);
      setLoading(false);
    } else {
      fetchPrograms();
    }
  }, [isStudent, user]);

  const openCreate = () => {
    setForm({ name: '', description: '', duration: '', fee: '' });
    setFieldErrors({});
    setFormError('');
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({
      name: p.name,
      description: p.description || '',
      duration: p.duration || '',
      fee: p.fee ?? ''
    });
    setFieldErrors({});
    setFormError('');
    setModal(p._id);
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
    const payload = { ...form, fee: form.fee === '' ? 0 : Number(form.fee) };
    try {
      if (modal === 'create') {
        await axiosInstance.post('/programs', payload);
      } else {
        await axiosInstance.put(`/programs/${modal}`, payload);
      }
      setModal(null);
      fetchPrograms();
      toast.success(modal === 'create' ? 'Program created.' : 'Program updated.');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Request failed';
      setFormError(msg);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDialog({
      title: 'Delete program',
      message: 'Delete this program?',
      confirmLabel: 'Delete',
      variant: 'danger'
    });
    if (!confirmed) return;
    try {
      await axiosInstance.delete(`/programs/${id}`);
      setModal(null);
      fetchPrograms();
      toast.success('Program deleted.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="page-loading-spinner" aria-hidden />
        <span style={{ marginLeft: '0.75rem' }}>Loading programs…</span>
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
        <h1 className="page-heading">{isStudent ? 'My Program' : 'Programs'}</h1>
        {isAdmin && (
          <div className="page-actions">
            <button type="button" className="btn btn-primary-app" onClick={openCreate}>
              <AddCircleOutlineOutlinedIcon fontSize="small" />
              Add program
            </button>
          </div>
        )}
      </header>

      <div className="program-grid">
        {programs.map((p) => (
          <div key={p._id} className="program-card">
            <h3 className="program-card-title">{p.name}</h3>
            <p className="program-card-meta">{p.description || '—'}</p>
            <p className="program-card-meta">Duration: {p.duration || '—'}</p>
            <p className="program-card-meta">Fee: ₹{p.fee ?? 0}</p>
            {isAdmin && !isStudent && (
              <div className="program-card-actions">
                <button type="button" className="btn btn-ghost-app" onClick={() => openEdit(p)}>
                  <EditOutlinedIcon fontSize="small" />
                </button>
                <button type="button" className="btn btn-danger-app" onClick={() => handleDelete(p._id)}>
                  <DeleteOutlineOutlinedIcon fontSize="small" />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {programs.length === 0 && (
        <EmptyState
          message={isStudent ? 'You are not enrolled in a program yet.' : 'No programs yet.'}
          description={isStudent ? 'Contact your advisor to get enrolled.' : 'Add a program to get started.'}
        />
      )}

      {modal && (
        <div className="app-modal-overlay" onClick={() => setModal(null)} role="dialog" aria-modal="true" aria-labelledby="program-modal-title">
          <div className="app-modal" onClick={(e) => e.stopPropagation()}>
            <h2 id="program-modal-title" className="app-modal-title">
              {modal === 'create' ? 'New program' : 'Edit program'}
            </h2>
            {formError && (
              <div className="login-alert login-alert-error" role="alert">
                {formError}
              </div>
            )}
            <form onSubmit={handleSubmit} className="login-form" noValidate>
              <div className={`login-field required ${fieldErrors.name ? 'login-field-error' : ''}`}>
                <label htmlFor="program-name" className="login-label">Name</label>
                <input
                  id="program-name"
                  type="text"
                  className="login-input"
                  value={form.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Program name"
                  aria-invalid={!!fieldErrors.name}
                />
                {fieldErrors.name && <span className="login-field-message" role="alert">{fieldErrors.name}</span>}
              </div>
              <div className="login-field">
                <label htmlFor="program-desc" className="login-label">Description</label>
                <textarea
                  id="program-desc"
                  className="login-input"
                  rows={2}
                  value={form.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Brief description"
                  style={{ resize: 'vertical', minHeight: '60px' }}
                />
              </div>
              <div className="login-field">
                <label htmlFor="program-duration" className="login-label">Duration</label>
                <input
                  id="program-duration"
                  type="text"
                  className="login-input"
                  value={form.duration}
                  onChange={(e) => handleChange('duration', e.target.value)}
                  placeholder="e.g. 6 months"
                />
              </div>
              <div className="login-field">
                <label htmlFor="program-fee" className="login-label">Fee</label>
                <input
                  id="program-fee"
                  type="number"
                  className="login-input"
                  value={form.fee}
                  onChange={(e) => handleChange('fee', e.target.value)}
                  placeholder="0"
                />
              </div>
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
