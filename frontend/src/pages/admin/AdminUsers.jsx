import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { Users, CheckCircle, ShieldAlert } from 'lucide-react';
import { selectUser } from '../../features/auth/authSlice';
import {
    getUsersAsync,
    toggleBlockUserAsync,
    deleteUserAsync,
    setSearch,
    setPage,
    setPageSize,
    selectAdminUsers,
    selectAdminUsersCount,
    selectAdminUsersPage,
    selectAdminUsersPageSize,
    selectAdminUsersTotalPages,
    selectAdminUsersSearch,
    selectAdminUsersLoading,
    selectAdminUsersError
} from '../../features/admin/adminUsersSlice';
import SearchBar from './SearchBar';
import UserTable from './UserTable';
import Pagination from './Pagination';
import ConfirmationDialog from './ConfirmationDialog';

function AdminUsers() {
    const dispatch = useDispatch();
    const currentAdmin = useSelector(selectUser);

    const users = useSelector(selectAdminUsers);
    const count = useSelector(selectAdminUsersCount);
    const page = useSelector(selectAdminUsersPage);
    const pageSize = useSelector(selectAdminUsersPageSize);
    const totalPages = useSelector(selectAdminUsersTotalPages);
    const search = useSelector(selectAdminUsersSearch);
    const loading = useSelector(selectAdminUsersLoading);
    const error = useSelector(selectAdminUsersError);

    // Modal state
    const [dialogOpen, setDialogOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [actionType, setActionType] = useState(''); // 'block' or 'delete'

    // Load users on mount and query changes
    useEffect(() => {
        dispatch(getUsersAsync({ page, page_size: pageSize, search }));
    }, [dispatch, page, pageSize, search]);

    // Handle toast error if any
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);

    const handleSearch = (newSearch) => {
        dispatch(setSearch(newSearch));
    };

    const handlePageChange = (newPage) => {
        dispatch(setPage(newPage));
    };

    const handlePageSizeChange = (newPageSize) => {
        dispatch(setPageSize(newPageSize));
    };

    const handleBlockToggleClick = (user) => {
        setSelectedUser(user);
        setActionType('block');
        setDialogOpen(true);
    };

    const handleDeleteToggleClick = (user) => {
        setSelectedUser(user);
        setActionType('delete');
        setDeleteDialogOpen(true);
    };

    const handleConfirmBlockToggle = async () => {
        if (!selectedUser) return;
        
        const uuid = selectedUser.id;
        setActionLoadingId(uuid);

        try {
            const result = await dispatch(toggleBlockUserAsync(uuid)).unwrap();
            const actionText = result.blocked ? 'blocked' : 'unblocked';
            toast.success(`User ${actionText} successfully.`);
            setDialogOpen(false);
        } catch (err) {
            toast.error(err || 'Failed to update user.');
        } finally {
            setActionLoadingId(null);
            setSelectedUser(null);
            setActionType('');
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedUser) return;

        const uuid = selectedUser.id;
        setActionLoadingId(uuid);

        try {
            await dispatch(deleteUserAsync(uuid)).unwrap();
            toast.success("User deleted successfully.");
            setDeleteDialogOpen(false);

            // Automatically load previous page if current page becomes empty
            if (users.length === 1 && page > 1) {
                dispatch(setPage(page - 1));
            }
        } catch (err) {
            toast.error(err || 'Unable to delete user.');
        } finally {
            setActionLoadingId(null);
            setSelectedUser(null);
            setActionType('');
        }
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>Manage Users</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        View, search, block, and delete accounts in the store database.
                    </p>
                </div>
                <SearchBar value={search} onSearchChange={handleSearch} />
            </div>

            {/* Statistics Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* Total Users Card */}
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--accent-bg)',
                        color: 'var(--accent-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <Users size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL USERS</p>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{count}</h4>
                    </div>
                </div>

                {/* Verified Accounts Card */}
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--success-bg)',
                        color: 'var(--success-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <CheckCircle size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>VERIFIED (PAGE)</p>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {users.filter(u => u.is_verified).length} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>/ {users.length}</span>
                        </h4>
                    </div>
                </div>

                {/* Blocked Accounts Card */}
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    padding: '20px',
                    border: '1px solid var(--border-color)',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    transition: 'transform 0.2s',
                    cursor: 'default'
                }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '12px',
                        backgroundColor: 'var(--error-bg)',
                        color: 'var(--error-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <ShieldAlert size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>BLOCKED (PAGE)</p>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>
                            {users.filter(u => u.blocked).length} <span style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: '500' }}>/ {users.length}</span>
                        </h4>
                    </div>
                </div>
            </div>

            <UserTable
                users={users}
                loading={loading && users.length === 0} // Show full table loading skeleton only on initial list pull
                onBlockToggle={handleBlockToggleClick}
                onDeleteToggle={handleDeleteToggleClick}
                actionLoadingId={actionLoadingId}
                actionType={actionType}
                currentAdminId={currentAdmin?.id}
            />

            {!loading && users.length === 0 && (
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    padding: '48px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)'
                }}>
                    <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '16px' }}>No users found matching the search query.</p>
                </div>
            )}

            {users.length > 0 && (
                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    count={count}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            <ConfirmationDialog
                isOpen={dialogOpen}
                onClose={() => { setDialogOpen(false); setSelectedUser(null); setActionType(''); }}
                onConfirm={handleConfirmBlockToggle}
                title={selectedUser?.blocked ? "Unblock User" : "Block User"}
                message={selectedUser
                    ? (selectedUser.blocked 
                        ? `Are you sure you want to unblock ${selectedUser.first_name} ${selectedUser.last_name}? They will be allowed to log in and access the store again.`
                        : `Are you sure you want to block ${selectedUser.first_name} ${selectedUser.last_name}? They will be immediately blocked from logging into their account.`)
                    : ''
                }
                confirmText={selectedUser?.blocked ? "Unblock" : "Block"}
                cancelText="Cancel"
                isLoading={actionLoadingId === selectedUser?.id && actionType === 'block'}
            />

            <ConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setSelectedUser(null); setActionType(''); }}
                onConfirm={handleConfirmDelete}
                title="Delete User"
                message="Are you sure you want to permanently delete this user? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
                isLoading={actionLoadingId === selectedUser?.id && actionType === 'delete'}
            />
        </div>
    );
}

export default AdminUsers;
