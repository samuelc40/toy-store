import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { FolderOpen, Plus, FolderPlus, HelpCircle } from "lucide-react";
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
  selectAdminCategoriesError,
} from "../../features/admin/adminCategoriesSlice";
import SearchBar from "./SearchBar";
import CategoryTable from "./CategoryTable";
import Pagination from "./Pagination";
import ConfirmationDialog from "./ConfirmationDialog";
import CategoryFormModal from "./CategoryFormModal";
import "./AdminCategories.css";

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
    if (error && typeof error === "string") {
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
        await dispatch(
          updateCategoryAsync({ uuid: selectedCategory.id, formData }),
        ).unwrap();
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
      if (err && typeof err === "object") {
        setServerErrors(err);
        if (typeof err.detail === "string") {
          toast.error(err.detail);
        } else if (typeof err.message === "string") {
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
    <div className="admin-categories-container">
      {/* Header row */}
      <div className="admin-categories-header">
        <div className="admin-categories-title-group">
          <h3 className="admin-categories-title">Category Management</h3>
          <p className="admin-categories-subtitle">
            Manage all product categories.
          </p>
        </div>
        <div className="admin-categories-actions">
          <button onClick={handleAddClick} className="btn-add-category">
            <Plus size={16} /> Add Category
          </button>
        </div>
      </div>

      {/* Statistics Summary Row */}
      <div className="admin-categories-stats-grid">
        <div className="admin-categories-stat-card">
          <div className="admin-categories-stat-icon">
            <FolderOpen size={22} />
          </div>
          <div>
            <p className="admin-categories-stat-label">TOTAL CATEGORIES</p>
            <h4 className="admin-categories-stat-value">{count}</h4>
          </div>
        </div>
      </div>

      {/* Search and Filter Row */}
      <div className="admin-categories-toolbar">
        <div className="admin-categories-search-wrapper">
          <SearchBar
            value={search}
            onSearchChange={handleSearch}
            placeholder="Search categories by name..."
          />
        </div>

        <div className="admin-categories-sort-wrapper">
          <span className="admin-categories-sort-label">Sort by</span>
          <select
            value={sort}
            onChange={handleSortChange}
            className="admin-categories-sort-select"
          >
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
        <div className="admin-categories-empty-state">
          <div className="admin-categories-empty-icon">
            <FolderPlus size={36} />
          </div>
          <div>
            <h4 className="admin-categories-empty-title">
              No Categories Found
            </h4>
            <p className="admin-categories-empty-desc">
              {search
                ? "No classifications match your search keywords. Try clearing the filters."
                : "Create your first category to start organizing scale models and remote toys."}
            </p>
          </div>
          {!search && (
            <button
              onClick={handleAddClick}
              style={{
                backgroundColor: "var(--accent-bg)",
                color: "var(--accent-color)",
                border: "none",
                padding: "10px 18px",
                borderRadius: "10px",
                fontWeight: "700",
                fontSize: "13.5px",
                cursor: "pointer",
                transition: "all 0.2s",
                marginTop: "8px",
              }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-border)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "var(--accent-bg)")
              }
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
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedCategory(null);
        }}
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
