import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { FolderOpen, Plus, FolderPlus, HelpCircle } from 'lucide-react';
import {
    getCategoriesAsync,
    createCategoryAsync,
    updateCategoryAsync,
    deleteCategoryAsync,
    setSearch,
    setPage,
    setPageSize,
    selectAdminCategories,
    selectAdminCategoriesCount,
    selectAdminCategoriesPage,
    selectAdminCategoriesPageSize,
    selectAdminCategoriesTotalPages,
    selectAdminCategoriesSearch,
    selectAdminCategoriesLoading,
    selectAdminCategoriesError
} from '../../features/admin/adminCategoriesSlice';
import SearchBar from './SearchBar';
import CategoryTable from './CategoryTable';
import Pagination from './Pagination';
import ConfirmationDialog from './ConfirmationDialog';
import CategoryFormModal from './CategoryFormModal';

function AdminCategories() {
    const dispatch = useDispatch();

    const categories = useSelector(selectAdminCategories);
    const count = useSelector(selectAdminCategoriesCount);
    const page = useSelector(selectAdminCategoriesPage);
    const pageSize = useSelector(selectAdminCategoriesPageSize);
    const totalPages = useSelector(selectAdminCategoriesTotalPages);
    const search = useSelector(selectAdminCategoriesSearch);
    const loading = useSelector(selectAdminCategoriesLoading);
    const error = useSelector(selectAdminCategoriesError);

    // Modal & Dialog state
    const [formModalOpen, setFormModalOpen] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [serverErrors, setServerErrors] = useState({});
    const [sort, setSort] = useState("newest");

    // Load categories on query params changes
    useEffect(() => {
        dispatch(getCategoriesAsync({ page, page_size: pageSize, search, sort }));
    }, [dispatch, page, pageSize, search, sort]);

    // Handle Redux error notifications
    useEffect(() => {
        if (error && typeof error === 'string') {
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

    const handleAddClick = () => {
        setSelectedCategory(null);
        setServerErrors({});
        setFormModalOpen(true);
    };

    const handleEditClick = (category) => {
        setSelectedCategory(category);
        setServerErrors({});
        setFormModalOpen(true);
    };

    const handleDeleteClick = (category) => {
        setSelectedCategory(category);
        setDeleteDialogOpen(true);
    };

    const handleSaveCategory = async (formData) => {
        setIsSaving(true);
        setServerErrors({});
        try {
            if (selectedCategory) {
                // Edit Category
                await dispatch(updateCategoryAsync({ uuid: selectedCategory.id, formData })).unwrap();
                toast.success("Category updated successfully.");
            } else {
                // Add Category
                await dispatch(createCategoryAsync(formData)).unwrap();
                toast.success("Category created successfully.");
            }
            setFormModalOpen(false);
            // Refresh list
            dispatch(getCategoriesAsync({ page, page_size: pageSize, search, sort }));
        } catch (err) {
            if (err && typeof err === 'object') {
                setServerErrors(err);
                if (typeof err.detail === 'string') {
                    toast.error(err.detail);
                } else if (typeof err.message === 'string') {
                    toast.error(err.message);
                }
            } else {
                toast.error(err || "Failed to save category.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleConfirmDelete = async () => {
        if (!selectedCategory) return;

        const uuid = selectedCategory.id;
        setActionLoadingId(uuid);

        try {
            await dispatch(deleteCategoryAsync(uuid)).unwrap();
            toast.success("Category deleted successfully.");
            setDeleteDialogOpen(false);

            // Automatically go to previous page if the current page becomes empty
            if (categories.length === 1 && page > 1) {
                dispatch(setPage(page - 1));
            }
        } catch (err) {
            toast.error(err || "Failed to delete category.");
        } finally {
            setActionLoadingId(null);
            setSelectedCategory(null);
        }
    };

    const handleSortChange = (e) => {
        setSort(e.target.value);
        dispatch(setPage(1));
    };

    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '20px', fontWeight: 800 }}>Category Management</h3>
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-secondary)', fontSize: '14px' }}>
                        Manage all product categories.
                    </p>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                    <button 
                        onClick={handleAddClick}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            backgroundColor: 'var(--accent-color)',
                            color: '#ffffff',
                            border: 'none',
                            padding: '12px 20px',
                            borderRadius: '12px',
                            fontWeight: '700',
                            cursor: 'pointer',
                            boxShadow: '0 4px 0 rgba(105, 41, 223, 0.4)',
                            transition: 'all 0.1s'
                        }}
                        onMouseDown={(e) => { e.currentTarget.style.transform = 'translateY(2px)'; e.currentTarget.style.boxShadow = '0 2px 0 rgba(105, 41, 223, 0.4)'; }}
                        onMouseUp={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 rgba(105, 41, 223, 0.4)'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 0 rgba(105, 41, 223, 0.4)'; }}
                    >
                        <Plus size={16} /> Add Category
                    </button>
                </div>
            </div>

            {/* Statistics Summary Row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
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
                        <FolderOpen size={22} />
                    </div>
                    <div>
                        <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)', fontWeight: '700', letterSpacing: '0.5px' }}>TOTAL CATEGORIES</p>
                        <h4 style={{ margin: '4px 0 0 0', fontSize: '22px', fontWeight: '800', color: 'var(--text-primary)' }}>{count}</h4>
                    </div>
                </div>
            </div>
            <div>
                <SearchBar 
                    value={search} 
                    onSearchChange={handleSearch} 
                    placeholder="Search categories by name..." 
                />

                <div className="catalog-sorting-dropdown-container">
                    <span className="sorting-prefix-label">Sort by</span>
                    <select value={sort} onChange={handleSortChange} className="sorting-select-field-element">
                        <option value="newest">Newest</option>
                        <option value="a_z">Name: A → Z</option>
                        <option value="z_a">Name: Z → A</option>
                    </select>
                </div>

            </div>

            {/* Table Component */}
            <CategoryTable
                categories={categories}
                loading={loading && categories.length === 0}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                actionLoadingId={actionLoadingId}
            />

            {/* Empty State */}
            {!loading && categories.length === 0 && (
                <div style={{
                    backgroundColor: 'var(--card-bg)',
                    borderRadius: '16px',
                    border: '1px solid var(--border-color)',
                    padding: '64px 24px',
                    textAlign: 'center',
                    boxShadow: 'var(--shadow)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '16px'
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--bg-secondary)',
                        color: 'var(--text-secondary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <FolderPlus size={36} />
                    </div>
                    <div>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '18px', fontWeight: '800', color: 'var(--text-primary)' }}>No Categories Found</h4>
                        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14.5px', maxWidth: '380px', lineHeight: '1.6' }}>
                            {search 
                                ? "No classifications match your search keywords. Try clearing the filters."
                                : "Create your first category to start organizing scale models and remote toys."
                            }
                        </p>
                    </div>
                    {!search && (
                        <button
                            onClick={handleAddClick}
                            style={{
                                backgroundColor: 'var(--accent-bg)',
                                color: 'var(--accent-color)',
                                border: 'none',
                                padding: '10px 18px',
                                borderRadius: '10px',
                                fontWeight: '700',
                                fontSize: '13.5px',
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                marginTop: '8px'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-border)'}
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'var(--accent-bg)'}
                        >
                            Create first category
                        </button>
                    )}
                </div>
            )}

            {/* Pagination Controls */}
            {categories.length > 0 && (
                <Pagination
                    page={page}
                    pageSize={pageSize}
                    totalPages={totalPages}
                    count={count}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                />
            )}

            {/* Add / Edit Form Modal */}
            <CategoryFormModal
                isOpen={formModalOpen}
                onClose={() => setFormModalOpen(false)}
                onSave={handleSaveCategory}
                category={selectedCategory}
                isSaving={isSaving}
                serverErrors={serverErrors}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationDialog
                isOpen={deleteDialogOpen}
                onClose={() => { setDeleteDialogOpen(false); setSelectedCategory(null); }}
                onConfirm={handleConfirmDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? Products belonging to this category will not be deleted."
                confirmText="Delete"
                cancelText="Cancel"
                isDanger={true}
                isLoading={actionLoadingId === selectedCategory?.id}
            />
        </div>
    );
}

export default AdminCategories;
