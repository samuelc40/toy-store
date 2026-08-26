import { useState, useCallback, useRef, useEffect } from 'react';
import { getDashboardAnalytics } from '../services/dashboardService';

export const useDashboardAnalytics = (initialParams = { date_range: 'this_month' }) => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const requestSeqRef = useRef(0);

  const fetchAnalytics = useCallback(async (params = {}) => {
    const currentSeq = ++requestSeqRef.current;
    setLoading(true);
    setError(null);

    try {
      const response = await getDashboardAnalytics(params);
      if (currentSeq === requestSeqRef.current) {
        if (response.success && response.data) {
          setAnalyticsData(response.data);
        } else {
          setError(response.message || 'Failed to load dashboard analytics.');
        }
      }
    } catch (err) {
      if (currentSeq === requestSeqRef.current) {
        const errMsg = err.response?.data?.message || 'Failed to load dashboard analytics. Please try again.';
        setError(typeof errMsg === 'object' ? Object.values(errMsg).flat().join(' ') : errMsg);
      }
    } finally {
      if (currentSeq === requestSeqRef.current) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(initialParams);
  }, []);

  return {
    analyticsData,
    loading,
    error,
    fetchAnalytics,
  };
};
