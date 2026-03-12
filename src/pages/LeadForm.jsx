import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useNotification } from '../context/NotificationContext';
import Dropdown from '../components/Dropdown';
import { IllustrationLoginHero } from '../components/Illustrations';

const apiBase = import.meta.env.VITE_API_URL || '';

export default function LeadForm() {
  const { toast } = useNotification();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    interestedProgram: '',
    source: 'website',
    notes: ''
  });
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    const base = apiBase || '';
    axios.get(`${base}/api/programs/public`).then((res) => {
      setPrograms(res.data.data || []);
    }).catch(() => setPrograms([]));
  }, []);

  const validate = () => {
    const next = {};
    if (!form.firstName.trim()) next.firstName = 'First name is required';
    if (!form.lastName.trim()) next.lastName = 'Last name is required';
    if (!form.email.trim()) next.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = 'Please enter a valid email';
    if (!form.phone.trim()) next.phone = 'Phone is required';
    if (!form.interestedProgram.trim()) next.interestedProgram = 'Program of interest is required';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) setFieldErrors((f) => ({ ...f, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await axios.post(`${apiBase || ''}/api/leads`, {
        ...form,
        interestedProgram: form.interestedProgram || undefined
      });
      setForm({ firstName: '', lastName: '', email: '', phone: '', interestedProgram: '', source: 'website', notes: '' });
      setFieldErrors({});
      toast.success("Thank you! Your inquiry has been submitted. We'll contact you soon.");
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to submit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-panel login-panel-brand">
        <div className="login-brand-content">
          <div className="login-logo" onClick={() => navigate('/home')} style={{ cursor: 'pointer' }}>
            <span className="login-logo-icon" aria-hidden>BRD</span>
            <span className="login-logo-text">BRD Institute</span>
          </div>
          <p className="login-tagline">
            Interested in a program? Submit your details and our team will reach out with information and next steps.
          </p>
          <div className="login-decoration" aria-hidden>
            <div className="login-dot" />
            <div className="login-dot" />
            <div className="login-dot" />
          </div>
          <IllustrationLoginHero />
        </div>
      </div>

      <div className="login-panel login-panel-form">
        <div className="login-form-wrapper">
          <div className="login-form-header">
            <h1 className="login-title">Request information</h1>
            <p className="login-subtitle">Submit your details and we’ll get in touch.</p>
          </div>

          {error && (
            <div className="login-alert login-alert-error" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" noValidate>
            <div className={`login-field required ${fieldErrors.firstName ? 'login-field-error' : ''}`}>
              <label htmlFor="lead-firstName" className="login-label">First name</label>
              <input
                id="lead-firstName"
                type="text"
                name="firstName"
                className="login-input"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Your first name"
                aria-invalid={!!fieldErrors.firstName}
              />
              {fieldErrors.firstName && <span className="login-field-message" role="alert">{fieldErrors.firstName}</span>}
            </div>
            <div className={`login-field required ${fieldErrors.lastName ? 'login-field-error' : ''}`}>
              <label htmlFor="lead-lastName" className="login-label">Last name</label>
              <input
                id="lead-lastName"
                type="text"
                name="lastName"
                className="login-input"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Your last name"
                aria-invalid={!!fieldErrors.lastName}
              />
              {fieldErrors.lastName && <span className="login-field-message" role="alert">{fieldErrors.lastName}</span>}
            </div>
            <div className={`login-field required ${fieldErrors.email ? 'login-field-error' : ''}`}>
              <label htmlFor="lead-email" className="login-label">Email</label>
              <input
                id="lead-email"
                type="email"
                name="email"
                className="login-input"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                aria-invalid={!!fieldErrors.email}
              />
              {fieldErrors.email && <span className="login-field-message" role="alert">{fieldErrors.email}</span>}
            </div>
            <div className={`login-field required ${fieldErrors.phone ? 'login-field-error' : ''}`}>
              <label htmlFor="lead-phone" className="login-label">Phone</label>
              <input
                id="lead-phone"
                type="tel"
                name="phone"
                className="login-input"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
                aria-required="true"
                aria-invalid={!!fieldErrors.phone}
              />
              {fieldErrors.phone && <span className="login-field-message" role="alert">{fieldErrors.phone}</span>}
            </div>
            <Dropdown
              id="lead-source"
              name="source"
              label="How did you hear about us?"
              value={form.source}
              onChange={handleChange}
              options={[
                { value: 'website', label: 'Website' },
                { value: 'referral', label: 'Referral' },
                { value: 'campaign', label: 'Campaign' },
                { value: 'other', label: 'Other' }
              ]}
            />
            <Dropdown
              id="lead-program"
              name="interestedProgram"
              label="Program of interest"
              placeholder="Select a program…"
              value={form.interestedProgram}
              onChange={handleChange}
              required
              error={fieldErrors.interestedProgram}
              options={programs.map((p) => ({ value: p._id, label: p.name }))}
            />
            <div className="login-field">
              <label htmlFor="lead-notes" className="login-label">Notes</label>
              <textarea
                id="lead-notes"
                name="notes"
                className="login-input"
                rows={3}
                value={form.notes}
                onChange={handleChange}
                placeholder="Any questions or comments…"
                style={{ resize: 'vertical', minHeight: '80px' }}
              />
            </div>
            <button type="submit" className="login-submit" disabled={loading}>
              {loading ? (
                <span className="login-submit-text">
                  <span className="login-spinner" aria-hidden /> Submitting…
                </span>
              ) : (
                'Submit'
              )}
            </button>
          </form>

          <p className="login-footer">
            Staff? <Link to="/login" className="login-link">Sign in to the portal</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
