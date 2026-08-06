import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { toast } from 'react-toastify';
import {
    addToWishlistAsync,
    removeFromWishlistAsync,
    selectWishlistItems,
} from '../redux/wishlistSlice';
import { selectIsAuthenticated } from '../../auth/authSlice';

/**
 * Reusable Wishlist Heart Toggle Button.
 * Syncs visually with Redux wishlist state.
 * Handles auth redirects and event isolation (prevents parent link navigation).
 */
export function WishlistButton({
    productId,
    productName,
    className = '',
    size = 16,
    showText = false,
}) {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const wishlistItems = useSelector(selectWishlistItems);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [animatePop, setAnimatePop] = useState(false);

    // Compute active wishlist status strictly from Redux state
    const isWishlisted = wishlistItems.some(
        (item) => item.product?.id === productId || item.product === productId
    );

    const labelName = productName ? `"${productName}"` : 'product';

    const handleWishlistToggle = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isSubmitting) return;

        // Redirect unauthenticated guests to login
        if (!isAuthenticated) {
            toast.warning('Please log in to manage your wishlist.');
            navigate('/login', { state: { from: location.pathname } });
            return;
        }

        setIsSubmitting(true);
        setAnimatePop(true);
        setTimeout(() => setAnimatePop(false), 600);

        try {
            if (isWishlisted) {
                await dispatch(removeFromWishlistAsync(productId)).unwrap();
                toast.info(`Removed ${labelName} from your wishlist.`);
            } else {
                await dispatch(addToWishlistAsync(productId)).unwrap();
                toast.success(`Added ${labelName} to your wishlist!`);
            }
        } catch (err) {
            toast.error(typeof err === 'string' ? err : 'Wishlist update failed.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <button
            type="button"
            onClick={handleWishlistToggle}
            disabled={isSubmitting}
            aria-label={
                isWishlisted
                    ? `Remove ${labelName} from wishlist`
                    : `Add ${labelName} to wishlist`
            }
            className={`btn-wishlist-card-overlay ${isWishlisted ? 'active-wish' : ''} ${animatePop ? 'pop-animating' : ''} ${className}`}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
            <Heart
                size={size}
                className={`wishlist-heart-icon-svg ${animatePop ? 'heart-pop-keyframe' : ''}`}
                fill={isWishlisted ? 'currentColor' : 'none'}
            />
            {showText && (
                <span className="wishlist-btn-text-lbl">
                    {isWishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}
                </span>
            )}
        </button>
    );
}

export default WishlistButton;
