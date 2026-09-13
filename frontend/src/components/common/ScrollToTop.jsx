import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * ScrollToTop Component
 * Ensures that whenever the route pathname or search parameters change,
 * the browser window and any scrollable container (e.g. admin layout main content area)
 * automatically reset scroll position back to the top (0, 0).
 */
export default function ScrollToTop() {
    const { pathname, search } = useLocation();

    useEffect(() => {
        // Reset window scroll position
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant',
        });

        if (document.documentElement) {
            document.documentElement.scrollTop = 0;
        }

        if (document.body) {
            document.body.scrollTop = 0;
        }

        // Reset scroll position for admin content area if present
        const adminContent = document.querySelector('.admin-content');
        if (adminContent) {
            adminContent.scrollTop = 0;
        }
    }, [pathname, search]);

    return null;
}
