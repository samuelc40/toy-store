import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { Plus, ShoppingBag } from "lucide-react";

import {
  getProductsAsync,
  createProductAsync,
  updateProductAsync,
  deleteProductAsync,
  toggleBlockProductAsync,
  setPage,
  setPageSize,
  setSelectedProduct,
  clearError,
  selectProducts,
  selectSelectedProduct,
  selectProductsLoading,
  selectProductsCreating,
  selectProductsUpdating,
  selectProductsDeleting,
  selectProductsBlocking,
  selectProductsPagination,
  selectProductsSearch,
  selectProductsError,
} from "../redux/productSlice";

import { fetchCategoriesForDropdown } from "../services/productService";
import {
  createVariantAsync,
  updateVariantAsync,
  uploadVariantImagesAsync,
  deleteVariantImageAsync,
  toggleBlockVariantAsync,
  deleteVariantAsync,
  selectVariants,
} from "../redux/variantSlice";

import ProductToolbar from "../components/ProductToolbar";
import ProductTable from "../components/ProductTable";
import ProductPagination from "../components/ProductPagination";
import ProductModal from "../components/ProductModal";
import DeleteProductModal from "../components/DeleteProductModal";
import BlockProductModal from "../components/BlockProductModal";

import "../styles/ProductManagement.css";

/**
 * Controller Page for Product Management. Wires up components and Redux logic.
 */
export function ProductManagementPage() {
  const dispatch = useDispatch();

  // Redux State Selectors
  const products = useSelector(selectProducts);
  const selectedProduct = useSelector(selectSelectedProduct);
  const loading = useSelector(selectProductsLoading);
  const creating = useSelector(selectProductsCreating);
  const updating = useSelector(selectProductsUpdating);
  const deleting = useSelector(selectProductsDeleting);
  const blocking = useSelector(selectProductsBlocking);
  const pagination = useSelector(selectProductsPagination);
  const search = useSelector(selectProductsSearch);
  const error = useSelector(selectProductsError);
  const variants = useSelector(selectVariants);

  const { page, page_size, total_pages, count } = pagination;

  // Local Component State
  const [categories, setCategories] = useState([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [blockModalOpen, setBlockModalOpen] = useState(false);
  const [isReadOnly, setIsReadOnly] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [createdProduct, setCreatedProduct] = useState(null);

  // Fetch products automatically when query parameters change
  useEffect(() => {
    dispatch(getProductsAsync({ page, page_size, search }));
  }, [dispatch, page, page_size, search]);

  // Load active categories for form dropdown
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const res = await fetchCategoriesForDropdown();
        if (res.success && res.data) {
          setCategories(res.data.results || []);
        }
      } catch (err) {
        console.error("Failed to load categories", err);
        toast.error("Could not load categories for the select options.");
      }
    };
    loadCategories();
  }, []);

  // Watch for Redux Errors and notify
  useEffect(() => {
    if (error) {
      if (typeof error === "string") {
        toast.error(error);
      } else if (typeof error === "object") {
        // If field validation error details returned
        Object.keys(error).forEach((key) => {
          const messages = error[key];
          if (Array.isArray(messages)) {
            toast.error(`${key}: ${messages[0]}`);
          } else {
            toast.error(`${key}: ${messages}`);
          }
        });
      }
      dispatch(clearError());
    }
  }, [error, dispatch]);

  // View Product Handler
  const handleViewProduct = (product) => {
    setIsReadOnly(true);
    setCreatedProduct(null);
    dispatch(setSelectedProduct(product));
    setProductModalOpen(true);
  };

  // Edit Product Handler
  const handleEditProduct = (product) => {
    setIsReadOnly(false);
    setCreatedProduct(null);
    dispatch(setSelectedProduct(product));
    setProductModalOpen(true);
  };

  // Open Add Product Dialog
  const handleAddProduct = () => {
    setIsReadOnly(false);
    setCreatedProduct(null);
    dispatch(setSelectedProduct(null));
    setProductModalOpen(true);
  };

  // Helper to sanitize variant data payload for backend API
  const cleanVariantPayload = (v) => ({
    variant_name: v.variant_name?.trim() || "",
    sku: v.sku?.trim() || "",
    price: v.price,
    sale_price:
      v.sale_price !== "" &&
      v.sale_price !== null &&
      !isNaN(Number(v.sale_price))
        ? v.sale_price
        : null,
    stock_quantity: v.stock_quantity,
    display_order: v.display_order,
  });

  // Save Form Handler (Add/Edit submission)
  const handleSaveProduct = async (formData, localVariants = []) => {
    setIsSaving(true);
    try {
      const activeProduct = selectedProduct || createdProduct;
      let targetProductId = activeProduct ? activeProduct.id : null;

      if (targetProductId) {
        // Update existing product
        await dispatch(
          updateProductAsync({ id: targetProductId, productData: formData }),
        ).unwrap();
      } else {
        // Create new product
        const resultAction = await dispatch(
          createProductAsync(formData),
        ).unwrap();
        targetProductId = resultAction.id;
        setCreatedProduct(resultAction);
      }

      // Update/Create variants sequentially
      for (const v of localVariants) {
        const variantPayload = cleanVariantPayload(v);

        if (String(v.id).startsWith("draft-")) {
          // Create new variant
          const varResult = await dispatch(
            createVariantAsync({
              productId: targetProductId,
              variantData: variantPayload,
            }),
          ).unwrap();

          const newVariantId = varResult.id;
          v.id = newVariantId;
          if (v.newImagesQueue && v.newImagesQueue.length > 0) {
            const files = v.newImagesQueue.map(
              (item) => item.croppedBlob || item.file,
            );
            await dispatch(
              uploadVariantImagesAsync({ variantId: newVariantId, files }),
            ).unwrap();
            v.newImagesQueue = [];
          }
          // Block variant if toggle was set to true on the draft card
          if (v.blocked) {
            await dispatch(toggleBlockVariantAsync(newVariantId)).unwrap();
          }
          // Soft delete if active status is set to false on draft card
          if (!v.is_active) {
            await dispatch(deleteVariantAsync(newVariantId)).unwrap();
          }
        } else {
          // Update existing variant details
          await dispatch(
            updateVariantAsync({ id: v.id, variantData: variantPayload }),
          ).unwrap();

          // Trigger blocking / deactivating if modified
          const original = variants.find((ov) => ov.id === v.id);
          if (original) {
            if (original.blocked !== v.blocked) {
              await dispatch(toggleBlockVariantAsync(v.id)).unwrap();
            }
            if (original.is_active && !v.is_active) {
              await dispatch(deleteVariantAsync(v.id)).unwrap();
            }
          }

          // 1. Upload new images first
          if (v.newImagesQueue && v.newImagesQueue.length > 0) {
            const files = v.newImagesQueue.map(
              (item) => item.croppedBlob || item.file,
            );
            await dispatch(
              uploadVariantImagesAsync({ variantId: v.id, files }),
            ).unwrap();
            v.newImagesQueue = [];
          }

          // 2. Delete marked existing images second
          if (v.deletedImageIds && v.deletedImageIds.length > 0) {
            for (const imageId of v.deletedImageIds) {
              await dispatch(
                deleteVariantImageAsync({ variantId: v.id, imageId }),
              ).unwrap();
            }
            v.deletedImageIds = [];
          }
        }
      }
      toast.success(
        selectedProduct
          ? "Product and variants updated successfully."
          : "Product, variants, and images created successfully.",
      );
      setProductModalOpen(false);
      setCreatedProduct(null);
      dispatch(
        getProductsAsync({
          page: selectedProduct ? page : 1,
          page_size,
          search: selectedProduct ? search : "",
        }),
      );
    } catch (err) {
      console.error("Unified Save Error:", err);
      if (typeof err === "string") {
        toast.error(err);
      } else if (err && typeof err === "object") {
        let msg = err.detail || err.message;
        if (!msg && err.images) {
          msg = Array.isArray(err.images) ? err.images[0] : err.images;
        }
        if (!msg && err.sale_price) {
          msg = Array.isArray(err.sale_price)
            ? `Sale Price: ${err.sale_price[0]}`
            : err.sale_price;
        }
        if (!msg && err.sku) {
          msg = Array.isArray(err.sku) ? `SKU: ${err.sku[0]}` : err.sku;
        }
        if (!msg && err.variant_name) {
          msg = Array.isArray(err.variant_name)
            ? `Variant Name: ${err.variant_name[0]}`
            : err.variant_name;
        }
        toast.error(
          msg || "An error occurred during the product save workflow.",
        );
      } else {
        toast.error("An error occurred during the product save workflow.");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Delete Modal triggers
  const handleDeleteClick = (product) => {
    dispatch(setSelectedProduct(product));
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    const resultAction = await dispatch(deleteProductAsync(selectedProduct.id));
    if (deleteProductAsync.fulfilled.match(resultAction)) {
      toast.success("Product deleted successfully (soft deleted).");
      setDeleteModalOpen(false);
      dispatch(getProductsAsync({ page, page_size, search }));
    }
  };

  // Block Modal triggers
  const handleBlockClick = (product) => {
    dispatch(setSelectedProduct(product));
    setBlockModalOpen(true);
  };

  const handleConfirmBlock = async () => {
    if (!selectedProduct) return;
    const resultAction = await dispatch(
      toggleBlockProductAsync(selectedProduct.id),
    );
    if (toggleBlockProductAsync.fulfilled.match(resultAction)) {
      const blocked = resultAction.payload.blocked;
      toast.success(
        blocked
          ? "Product blocked successfully."
          : "Product unblocked successfully.",
      );
      setBlockModalOpen(false);
      dispatch(getProductsAsync({ page, page_size, search }));
    }
  };

  // Page updates
  const handlePageChange = (newPage) => {
    dispatch(setPage(newPage));
  };

  const handlePageSizeChange = (newSize) => {
    dispatch(setPageSize(newSize));
  };

  return (
    <div className="product-management-page">
      {/* Title Block */}
      <div className="product-page-header">
        <div className="header-title-section">
          <h3>Products</h3>
          <p>Manage your toy store catalogue.</p>
        </div>
        <button
          type="button"
          onClick={handleAddProduct}
          className="btn-add-product"
        >
          <Plus size={18} /> Add Product
        </button>
      </div>

      {/* Toolbar (Search) */}
      <ProductToolbar />

      {/* Product Table */}
      <ProductTable
        products={products}
        loading={loading}
        onView={handleViewProduct}
        onEdit={handleEditProduct}
        onBlock={handleBlockClick}
        onDelete={handleDeleteClick}
        disabled={creating || updating || deleting || blocking}
      />

      {/* Pagination Controls */}
      {!loading && products.length > 0 && (
        <ProductPagination
          page={page}
          pageSize={page_size}
          totalPages={total_pages}
          count={count}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
        />
      )}

      {/* Add / Edit / View Modal */}
      <ProductModal
        isOpen={productModalOpen}
        onClose={() => setProductModalOpen(false)}
        onSubmit={handleSaveProduct}
        product={selectedProduct}
        categories={categories}
        isLoading={isSaving}
        isReadOnly={isReadOnly}
      />

      {/* Delete Modal */}
      <DeleteProductModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        product={selectedProduct}
        isLoading={deleting}
      />

      {/* Block Modal */}
      <BlockProductModal
        isOpen={blockModalOpen}
        onClose={() => setBlockModalOpen(false)}
        onConfirm={handleConfirmBlock}
        product={selectedProduct}
        isLoading={blocking}
      />
    </div>
  );
}

export default ProductManagementPage;
