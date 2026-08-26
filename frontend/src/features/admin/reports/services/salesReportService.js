import api from "../../../../api/axios";

/**
 * Fetch sales report data from backend API.
 * @param {object} params - { date_range, start_date, end_date, group_by }
 * @returns {Promise<object>} API response payload
 */
export const getSalesReport = async (params = {}) => {
  const response = await api.get("/admin/orders/reports/sales/", { params });
  return response.data;
};

/**
 * Triggers a browser file download from an API blob response.
 */
const triggerBlobDownload = (response, fallbackFileName) => {
  let fileName = fallbackFileName;
  const disposition = response.headers?.["content-disposition"];
  if (disposition && disposition.includes("filename=")) {
    const match = disposition.match(/filename="?([^";]+)"?/);
    if (match && match[1]) {
      fileName = match[1];
    }
  }

  const blob = new Blob([response.data], {
    type: response.headers?.["content-type"] || "application/octet-stream",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

/**
 * Download Sales Report as PDF.
 * @param {object} params
 */
export const downloadSalesReportPDF = async (params = {}) => {
  const response = await api.get("/admin/orders/reports/sales/export/pdf/", {
    params,
    responseType: "blob",
  });
  triggerBlobDownload(response, "sales-report.pdf");
};

/**
 * Download Sales Report as Excel (XLSX).
 * @param {object} params
 */
export const downloadSalesReportExcel = async (params = {}) => {
  const response = await api.get("/admin/orders/reports/sales/export/excel/", {
    params,
    responseType: "blob",
  });
  triggerBlobDownload(response, "sales-report.xlsx");
};
