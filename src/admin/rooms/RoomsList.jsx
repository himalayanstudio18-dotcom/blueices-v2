import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { listRooms, roomImagePublicUrl, updateRoom, deleteRoom, duplicateRoom, setRoomOrder } from './roomsApi';
import { useAdminAuth } from '../AdminAuthContext';
import { logActivity } from '../activityLogApi';
import { friendlyError } from '../friendlyError';
import { useToast, useConfirm } from '../ui/AdminUIProvider';
import { can } from '../permissions';

function formatUpdated(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function RoomsList() {
  const { staff, role } = useAdminAuth();
  const canCreate = can(role, 'rooms', 'create');
  const canEdit = can(role, 'rooms', 'edit');
  const canDelete = can(role, 'rooms', 'delete');
  const canPublish = can(role, 'rooms', 'publish');
  const canChangeAvailability = can(role, 'rooms', 'changeAvailability');
  const canReorder = can(role, 'rooms', 'reorder');
  const { showToast } = useToast();
  const confirm = useConfirm();
  const [rooms, setRooms] = useState(null);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('order');

  async function load() {
    try {
      setRooms(await listRooms());
      setError('');
    } catch (err) {
      setError(friendlyError(err, 'load rooms'));
    }
  }

  useEffect(() => { load(); }, []);

  async function togglePublished(room) {
    setBusyId(room.id);
    const nextPublished = !room.is_published;
    try {
      await updateRoom(room.id, { is_published: nextPublished });
      logActivity(staff, { action: nextPublished ? 'publish' : 'unpublish', entity: 'room', entityId: room.id, detail: room.name_en });
      showToast({
        type: 'success',
        title: nextPublished ? 'Room published' : 'Room unpublished',
        message: `"${room.name_en}" is ${nextPublished ? 'now visible on the live site' : 'no longer visible on the live site'}.`,
      });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: nextPublished ? 'Publish failed' : 'Unpublish failed', message: friendlyError(err, 'update this room') });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleAvailable(room) {
    setBusyId(room.id);
    const nextAvailable = !room.is_available;
    try {
      await updateRoom(room.id, { is_available: nextAvailable });
      showToast({
        type: 'success',
        title: 'Availability changed',
        message: `"${room.name_en}" is now marked ${nextAvailable ? 'available' : 'unavailable'}.`,
      });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Update failed', message: friendlyError(err, 'update availability') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDuplicate(room) {
    setBusyId(room.id);
    try {
      const created = await duplicateRoom(room.id);
      logActivity(staff, { action: 'create', entity: 'room', entityId: created.id, detail: `duplicated from ${room.name_en}` });
      showToast({ type: 'success', title: 'Room duplicated', message: `A draft copy of "${room.name_en}" was created.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Duplicate failed', message: friendlyError(err, 'duplicate this room') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(room) {
    const confirmed = await confirm({
      title: 'Delete Room?',
      message: `Are you sure you want to delete "${room.name_en}"? This action cannot be undone.`,
      confirmLabel: 'Delete Room',
    });
    if (!confirmed) return;

    setBusyId(room.id);
    try {
      await deleteRoom(room.id);
      logActivity(staff, { action: 'delete', entity: 'room', entityId: room.id, detail: room.name_en });
      showToast({ type: 'success', title: 'Room deleted', message: `"${room.name_en}" was deleted successfully.` });
      await load();
    } catch (err) {
      showToast({ type: 'error', title: 'Delete failed', message: friendlyError(err, 'delete this room') });
    } finally {
      setBusyId(null);
    }
  }

  async function handleMove(index, dir) {
    const next = [...rooms];
    const swapWith = index + dir;
    if (swapWith < 0 || swapWith >= next.length) return;
    [next[index], next[swapWith]] = [next[swapWith], next[index]];
    setRooms(next);
    await setRoomOrder(next);
  }

  const visibleRooms = useMemo(() => {
    let list = rooms ?? [];
    if (statusFilter === 'published') list = list.filter((r) => r.is_published);
    if (statusFilter === 'draft') list = list.filter((r) => !r.is_published);
    if (statusFilter === 'unavailable') list = list.filter((r) => !r.is_available);
    if (statusFilter === 'featured') list = list.filter((r) => r.is_featured);
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((r) =>
        r.name_en?.toLowerCase().includes(q) || r.room_type?.toLowerCase().includes(q)
      );
    }
    if (sortBy === 'name') list = [...list].sort((a, b) => a.name_en.localeCompare(b.name_en));
    if (sortBy === 'price') list = [...list].sort((a, b) => (a.price ?? 0) - (b.price ?? 0));
    if (sortBy === 'updated') list = [...list].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
    return list;
  }, [rooms, statusFilter, search, sortBy]);

  const reorderable = canReorder && statusFilter === 'all' && !search.trim() && sortBy === 'order';

  return (
    <div className="admin-page">
      <header className="admin-page-header admin-page-header--row">
        <div>
          <p className="admin-eyebrow">Rooms</p>
          <h1>Manage Rooms</h1>
        </div>
        {canCreate && (
          <Link to="/admin/rooms/new" className="admin-btn-primary admin-btn-link" aria-label="Add a new room">
            <span aria-hidden="true">+</span> Add Room
          </Link>
        )}
      </header>

      {error && (
        <div className="admin-error-state">
          <p>{error}</p>
          <button type="button" className="admin-btn-ghost admin-btn-ghost--dark" onClick={load}>Try Again</button>
        </div>
      )}

      {rooms === null && !error && (
        <div className="admin-loading-state">
          <div className="admin-spinner" aria-hidden="true" />
          <p>Loading rooms…</p>
        </div>
      )}

      {rooms?.length === 0 && !error && (
        <div className="admin-empty-state">
          <p className="admin-empty-state-title">No rooms added yet</p>
          <p className="admin-empty-state-sub">Get started by adding your first room.</p>
          {canCreate && <Link to="/admin/rooms/new" className="admin-btn-primary admin-btn-link">+ Add your first room</Link>}
        </div>
      )}

      {rooms && rooms.length > 0 && (
        <div className="admin-inquiries-toolbar">
          <div className="admin-filter-tabs">
            {['all', 'published', 'draft', 'featured', 'unavailable'].map((s) => (
              <button
                key={s}
                type="button"
                className={`admin-filter-tab${statusFilter === s ? ' is-active' : ''}`}
                onClick={() => setStatusFilter(s)}
              >
                {s[0].toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
          <div className="admin-rooms-toolbar-right">
            <input
              className="admin-search-input"
              type="search"
              placeholder="Search by name or type…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select className="admin-sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort rooms">
              <option value="order">Display Order</option>
              <option value="name">Name</option>
              <option value="price">Price</option>
              <option value="updated">Last Updated</option>
            </select>
          </div>
        </div>
      )}

      {rooms && rooms.length > 0 && visibleRooms.length === 0 && (
        <p>No rooms match your search or filter.</p>
      )}

      <div className="admin-room-list">
        {visibleRooms?.map((room, i) => {
          const cover = room.room_images?.find((img) => img.is_cover) ?? room.room_images?.[0];
          const busy = busyId === room.id;
          return (
            <div key={room.id} className="admin-room-row">
              <div className="admin-room-row-img">
                {cover
                  ? <img src={roomImagePublicUrl(cover.storage_path)} alt="" />
                  : <div className="admin-room-row-img-empty">No photo</div>}
              </div>
              <div className="admin-room-row-body">
                <h3>{room.name_en}</h3>
                <p>
                  {[room.room_type, room.tag_en].filter(Boolean).join(' · ')}
                  {room.room_type || room.tag_en ? ' · ' : ''}₹{room.price}/night
                  {room.max_guests ? ` · ${room.max_guests} guests` : ''}
                </p>
                <p className="admin-room-row-updated">Updated {formatUpdated(room.updated_at)}</p>
              </div>
              <div className="admin-room-row-badges">
                <span className={`admin-badge ${room.is_published ? 'is-live' : 'is-draft'}`}>
                  {room.is_published ? 'Published' : 'Draft'}
                </span>
                {room.is_featured && <span className="admin-badge is-featured">Featured</span>}
                {!room.is_available && <span className="admin-badge is-unavailable">Unavailable</span>}
              </div>
              {reorderable && (
                <div className="admin-room-row-reorder">
                  <button type="button" onClick={() => handleMove(i, -1)} disabled={i === 0} aria-label="Move earlier">↑</button>
                  <button type="button" onClick={() => handleMove(i, 1)} disabled={i === visibleRooms.length - 1} aria-label="Move later">↓</button>
                </div>
              )}
              <div className="admin-room-row-actions">
                {canChangeAvailability && (
                  <button className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => toggleAvailable(room)} disabled={busy}>
                    {room.is_available ? 'Mark Unavailable' : 'Mark Available'}
                  </button>
                )}
                {canPublish && (
                  <button className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => togglePublished(room)} disabled={busy}>
                    {room.is_published ? 'Unpublish' : 'Publish'}
                  </button>
                )}
                {canEdit && <Link to={`/admin/rooms/${room.id}`} className="admin-btn-ghost admin-btn-ghost--dark">Edit</Link>}
                {canCreate && (
                  <button className="admin-btn-ghost admin-btn-ghost--dark" onClick={() => handleDuplicate(room)} disabled={busy}>Duplicate</button>
                )}
                {canDelete && (
                  <button className="admin-btn-ghost admin-btn-ghost--danger" onClick={() => handleDelete(room)} disabled={busy}>
                    {busy ? 'Deleting…' : 'Delete'}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
