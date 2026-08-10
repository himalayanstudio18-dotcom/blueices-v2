import React, { useEffect, useState } from 'react';
import { useAdminAuth } from '../AdminAuthContext';
import { listStaff, addStaff, updateStaffRole, removeStaff } from './staffApi';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';

const ROLES = ['owner', 'manager', 'editor', 'staff'];

const emptyForm = { email: '', password: '', name: '', role: 'staff' };

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
  const bytes = new Uint32Array(14);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (n) => chars[n % chars.length]).join('');
}

export default function StaffPage() {
  const { user, staff: currentStaff } = useAdminAuth();
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [staff, setStaff] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const [adding, setAdding] = useState(false);
  const [busyId, setBusyId] = useState(null);

  async function load() {
    try {
      setStaff(await listStaff());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load staff'));
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAdd(e) {
    e.preventDefault();
    setError('');
    setAdding(true);
    try {
      const created = await addStaff(form);
      logActivity(currentStaff, { action: 'create', entity: 'staff', entityId: created.id, detail: `${form.name} (${form.role})` });
      showToast({ type: 'success', title: 'Staff member added', message: `${form.name} can now sign in with the email and password you set.` });
      setForm(emptyForm);
      setShowPassword(false);
      await load();
    } catch (err) {
      const friendly = friendlyError(err, 'add this staff member');
      setError(friendly);
      showToast({ type: 'error', title: 'Add failed', message: friendly });
    } finally {
      setAdding(false);
    }
  }

  async function handleRoleChange(member, role) {
    setBusyId(member.id);
    try {
      await updateStaffRole(member.id, role);
      logActivity(currentStaff, { action: 'update', entity: 'staff', entityId: member.id, detail: `${member.name} → ${role}` });
      showToast({ type: 'success', title: 'Role updated', message: `${member.name} is now ${role}.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: friendlyError(err, "change this member's role") });
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(member) {
    const confirmed = await confirm({
      title: 'Remove Staff Access?',
      message: `Are you sure you want to remove admin access for "${member.name}"? This action cannot be undone.`,
      confirmLabel: 'Remove Access',
    });
    if (!confirmed) return;

    setBusyId(member.id);
    try {
      await removeStaff(member.id);
      logActivity(currentStaff, { action: 'delete', entity: 'staff', entityId: member.id, detail: member.name });
      showToast({ type: 'success', title: 'Staff removed', message: `${member.name} no longer has admin access.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Remove failed', message: friendlyError(err, 'remove this staff member') });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-page">
      <header className="admin-page-header">
        <p className="admin-eyebrow">Staff</p>
        <h1>Staff & Permissions</h1>
      </header>

      {error && <p className="admin-auth-error">{error}</p>}

      <section className="admin-form">
        <h2 className="admin-content-card-header">Add Staff Member</h2>
        <p className="admin-placeholder-note">
          Set an email and password for them below — their sign-in is created automatically and they can log in right away.
        </p>
        <form onSubmit={handleAdd} className="admin-form-grid">
          <label className="admin-field">
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="off"
              required
            />
          </label>
          <label className="admin-field">
            <span>Password</span>
            <div className="admin-password-row">
              <input
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
            <button
              type="button"
              className="admin-btn-ghost"
              onClick={() => { setForm((f) => ({ ...f, password: generatePassword() })); setShowPassword(true); }}
            >
              Generate password
            </button>
          </label>
          <label className="admin-field">
            <span>Name</span>
            <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
          </label>
          <label className="admin-field">
            <span>Role</span>
            <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}>
              {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
            </select>
          </label>
          <div className="admin-field" style={{ justifyContent: 'flex-end' }}>
            <button type="submit" className="admin-btn-primary" disabled={adding}>
              {adding ? 'Adding…' : 'Add Staff Member'}
            </button>
          </div>
        </form>
      </section>

      {staff === null && !error && <p>Loading…</p>}

      <div className="admin-room-list">
        {staff?.map((member) => {
          const busy = busyId === member.id;
          const isSelf = member.id === user?.id;
          return (
            <div key={member.id} className="admin-room-row">
              <div className="admin-room-row-body">
                <h3>{member.name}{isSelf && ' (you)'}</h3>
                <p className="admin-staff-uid">{member.id}</p>
              </div>
              <select
                className="admin-sort-select"
                aria-label={`Change role for ${member.name}`}
                value={member.role}
                onChange={(e) => handleRoleChange(member, e.target.value)}
                disabled={busy || isSelf}
              >
                {ROLES.map((r) => <option key={r} value={r}>{r[0].toUpperCase() + r.slice(1)}</option>)}
              </select>
              <div className="admin-room-row-actions">
                <button
                  className="admin-btn-ghost admin-btn-ghost--danger"
                  onClick={() => handleRemove(member)}
                  disabled={isSelf || busy}
                >
                  {busy ? 'Removing…' : 'Remove'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
