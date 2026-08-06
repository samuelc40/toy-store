import api from '../../api/axios';

export const fetchCategories = async ({ page, page_size, search, sort }) => {
    const response = await api.get('/admin/products/categories/', {
        params: {
            page,
            page_size,
            search,
            sort,
        }
    });
    return response.data;
};

export const createCategory = async (formData) => {
    const response = await api.post('/admin/products/categories/', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
};

export const updateCategory = async (uuid, formData) => {
    const response = await api.patch(`/admin/products/categories/${uuid}/`, formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        }
    });
    return response.data;
};

export const deleteCategory = async (uuid) => {
    const response = await api.delete(`/admin/products/categories/${uuid}/`);
    return response.data;
};
