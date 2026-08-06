import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Trash2, Mail, Globe, Calendar } from 'lucide-react';
import './UserTable.css';

const UserAvatar = ({ user, getAvatarUrl, getInitials }) => {
  const [imgFailed, setImgFailed] = useState(false);
  const url = getAvatarUrl(user);

  if (!url || imgFailed) {
    return (
      <div 
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--bg-secondary) 0%, var(--border-color) 100%)',
          color: 'var(--accent-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '700',
          fontSize: '14px',
          border: '2px solid var(--border-color)',
          boxShadow: 'var(--shadow)',
          userSelect: 'none'
        }}
        title={`${user.first_name || ''} ${user.last_name || ''}`}
      >
        {getInitials(user)}
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={user.first_name || 'User'}
      onError={() => setImgFailed(true)}
      style={{
        width: '40px',
        height: '40px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid var(--border-color)',
        boxShadow: 'var(--shadow)'
      }}
    />
  );
};

function UserTable({ users, loading, onBlockToggle, onDeleteToggle, actionLoadingId, actionType, currentAdminId }) {
  const getAvatarUrl = (user) => {
    const pic = user.profile_image || user.google_profile_picture;
    if (!pic) return null;
    if (pic.startsWith('http://') || pic.startsWith('https://')) {
      return pic;
    }
    const backendUrl = import.meta.env.VITE_API_BASE_URL 
      ? import.meta.env.VITE_API_BASE_URL.replace('/api/v1', '') 
      : 'http://localhost:8000';
    return `${backendUrl}${pic.startsWith('/') ? '' : '/'}${pic}`;
  };

  const getInitials = (user) => {
    const f = user.first_name ? user.first_name.charAt(0) : '';
    const l = user.last_name ? user.last_name.charAt(0) : '';
    return (f + l).toUpperCase() || 'U';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="user-table-card">
        <table className="user-table-el">
          <thead>
            <tr>
              <th>PROFILE</th>
              <th>NAME</th>
              <th className="col-email">EMAIL</th>
              <th className="col-phone">PHONE</th>
              <th className="col-provider">PROVIDER</th>
              <th className="col-verified">VERIFIED</th>
              <th>STATUS</th>
              <th className="col-joined">JOINED DATE</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i}>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
                </td>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '120px', height: '16px', borderRadius: '4px' }} />
                </td>
                <td className="col-email">
                  <div className="skeleton-shimmer" style={{ width: '180px', height: '16px', borderRadius: '4px' }} />
                </td>
                <td className="col-phone">
                  <div className="skeleton-shimmer" style={{ width: '100px', height: '16px', borderRadius: '4px' }} />
                </td>
                <td className="col-provider">
                  <div className="skeleton-shimmer" style={{ width: '70px', height: '24px', borderRadius: '6px' }} />
                </td>
                <td className="col-verified">
                  <div className="skeleton-shimmer" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
                </td>
                <td>
                  <div className="skeleton-shimmer" style={{ width: '80px', height: '24px', borderRadius: '12px' }} />
                </td>
                <td className="col-joined">
                  <div className="skeleton-shimmer" style={{ width: '90px', height: '16px', borderRadius: '4px' }} />
                </td>
                <td style={{ textAlign: 'right' }}>
                  <div className="btn-action-group">
                    <div className="skeleton-shimmer" style={{ width: '90px', height: '36px', borderRadius: '10px' }} />
                    <div className="skeleton-shimmer" style={{ width: '90px', height: '36px', borderRadius: '10px' }} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="user-table-card">
      <table className="user-table-el">
        <thead>
            <tr>
              <th>PROFILE</th>
              <th>NAME</th>
              <th className="col-email">EMAIL</th>
              <th className="col-phone">PHONE</th>
              <th className="col-provider">PROVIDER</th>
              <th className="col-verified">VERIFIED</th>
              <th>STATUS</th>
              <th className="col-joined">JOINED DATE</th>
              <th style={{ textAlign: 'center' }}>ACTIONS</th>
            </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const isSelf = user.id === currentAdminId;
            const isProcessing = actionLoadingId === user.id;

            return (
              <tr key={user.id}>
                <td data-label="PROFILE">
                  <UserAvatar user={user} getAvatarUrl={getAvatarUrl} getInitials={getInitials} />
                </td>
                <td data-label="NAME">
                  <div className="user-cell-name" title={`${user.first_name} ${user.last_name}`}>
                    <span className="user-cell-text">{user.first_name} {user.last_name}</span>
                    {isSelf && <span className="badge-self">You</span>}
                  </div>
                </td>
                <td data-label="EMAIL" className="col-email">
                  <div className="user-cell-email user-cell-text" title={user.email}>
                    {user.email}
                  </div>
                </td>
                <td data-label="PHONE" className="col-phone">
                  <div className="user-cell-phone user-cell-text" title={user.phone || ''}>
                    {user.phone || '-'}
                  </div>
                </td>
                <td data-label="PROVIDER" className="col-provider">
                  <span className={`badge-provider provider-icon-label ${user.auth_provider === 'google' ? 'provider-google' : 'provider-email'}`}>
                    {user.auth_provider === 'google' ? (
                      <>
                        <Globe size={12} />
                        Google
                      </>
                    ) : (
                      <>
                        <Mail size={12} />
                        Email
                      </>
                    )}
                  </span>
                </td>
                <td data-label="VERIFIED" className="col-verified">
                  <span className={`badge-pill ${user.is_verified ? 'badge-verified' : 'badge-unverified'}`}>
                    {user.is_verified ? 'Verified' : 'Not Verified'}
                  </span>
                </td>
                <td data-label="STATUS">
                  <span className={`badge-pill ${user.blocked ? 'badge-blocked' : 'badge-active'}`}>
                    {user.blocked ? 'Blocked' : 'Active'}
                  </span>
                </td>
                <td data-label="JOINED DATE" className="col-joined" style={{ color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'inherit' }}>
                    <Calendar size={18} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatDate(user.created_at)}</span>
                  </div>
                </td>
                <td data-label="ACTIONS" style={{ textAlign: 'right' }}>
                  <div className="btn-action-group">
                    {/* Block / Unblock Button */}
                    <button
                      type="button"
                      disabled={isSelf || isProcessing}
                      onClick={() => onBlockToggle(user)}
                      className={`btn-action-user ${user.blocked ? 'btn-unblock-action' : 'btn-block-action'}`}
                    >
                      {isProcessing && actionType === 'block' ? (
                        <span className="btn-loading-content">
                          <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                          </svg>
                          Saving...
                        </span>
                      ) : user.blocked ? (
                        <>
                          <ShieldCheck size={14} />
                          Unblock
                        </>
                      ) : (
                        <>
                          <ShieldAlert size={14} />
                          Block
                        </>
                      )}
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      disabled={isSelf || isProcessing}
                      onClick={() => onDeleteToggle(user)}
                      className="btn-action-user btn-delete-action"
                    >
                      {isProcessing && actionType === 'delete' ? (
                        <span className="btn-loading-content">
                          <svg className="spinner-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeDasharray="31.4 31.4" style={{ opacity: 0.2 }}></circle>
                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 13.5997 2.37562 15.1116 3.0434 16.4526" stroke="currentColor" strokeWidth="4" strokeLinecap="round"></path>
                          </svg>
                          Deleting...
                        </span>
                      ) : (
                        <>
                          <Trash2 size={14} />
                          Delete
                        </>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default UserTable;
