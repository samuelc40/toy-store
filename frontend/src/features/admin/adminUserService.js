import api from '../../api/axios';

export const fetchUsers = async ({ page, page_size, search }) => {
    const response = await api.get('/admin/users/', {
        params: {
            page,
            page_size,
            search,
        }
    });
    return response.data;
};

export const toggleBlockUser = async (uuid) => {
    const response = await api.patch(`/admin/users/${uuid}/block/`);
    return response.data;
};

export const deleteUser = async (uuid) => {
    const response = await api.delete(`/admin/users/${uuid}/`);
    return response.data;
};
