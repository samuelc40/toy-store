import { useState, useCallback, useRef, useEffect } from 'react';
import { getSalesReport } from '../services/salesReportService';

export const useSalesReport = (initialParams = { date_range: 'this_month', group_by: 'day' }) => {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestSeqRef = useRef(0);

  const fetchReport = useCallback(async (params = {}) => {
    const currentSeq = ++requestSeqRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await getSalesReport(params);
      // Prevent stale response race condition
      if (currentSeq === requestSeqRef.current) {
        if (response.success && response.data) {
          setReportData(response.data);
        } else {
          setError(response.message || 'Failed to load sales report data.');
        }
      }
    } catch (err) {
      if (currentSeq === requestSeqRef.current) {
        const errMsg = err.response?.data?.message || err.response?.data?.date_range || 'Failed to load sales report. Please check date filters and try again.';
        setError(typeof errMsg === 'object' ? Object.values(errMsg).flat().join(' ') : errMsg);
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchReport(initialParams);
  }, []);

  return {
    reportData,
    loading,
    error,
    fetchReport,
  };
};
