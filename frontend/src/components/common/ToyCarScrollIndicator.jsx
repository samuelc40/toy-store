import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import './ToyCarScrollIndicator.css';

/**
 * Custom Toy Car Scroll Indicator Component
 * Supports interactive drag-to-scroll, wheel spinning, physics tilt, dust trails, and celebration effects.
 */
export function ToyCarScrollIndicator() {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [isScrolling, setIsScrolling] = useState(false);
    const [scrollDirection, setScrollDirection] = useState('idle');
    const [wheelRotation, setWheelRotation] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isDragging, setIsDragging] = useState(false);

    const prevScrollY = useRef(0);
    const scrollTimeoutRef = useRef(null);
    const animFrameRef = useRef(null);
    const hasTriggeredConfetti = useRef(false);
    const isDraggingRef = useRef(false);
    const dragStartYRef = useRef(0);

    // Sync scroll position from window scroll
    const updateScrollProgress = useCallback(() => {
        const currentScrollY = window.scrollY;
        const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
        
        if (totalHeight <= 0) return;

        const progress = Math.min(Math.max(currentScrollY / totalHeight, 0), 1);
        setScrollProgress(progress);

        // Detect scroll direction & distance for wheel spin
        const deltaY = currentScrollY - prevScrollY.current;
        if (Math.abs(deltaY) > 0.5) {
            const direction = deltaY > 0 ? 'down' : 'up';
            setScrollDirection(direction);
            setIsScrolling(true);
            setWheelRotation((prev) => prev + deltaY * 3);

            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            scrollTimeoutRef.current = setTimeout(() => {
                if (!isDraggingRef.current) {
                    setIsScrolling(false);
                    setScrollDirection('idle');
                }
            }, 150);
        }

        // Check for bottom celebration (scrollProgress >= 0.98)
        if (progress >= 0.98) {
            if (!hasTriggeredConfetti.current) {
                hasTriggeredConfetti.current = true;
                triggerConfettiBurst();
            }
        } else if (progress < 0.95) {
            hasTriggeredConfetti.current = false;
        }

        prevScrollY.current = currentScrollY;
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            if (animFrameRef.current) {
                cancelAnimationFrame(animFrameRef.current);
            }
            animFrameRef.current = requestAnimationFrame(updateScrollProgress);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            window.removeEventListener('scroll', handleScroll);
            if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [updateScrollProgress]);

    // Helper: Scroll window directly based on clientY coordinate
    const scrollToClientY = useCallback((clientY) => {
        const totalScrollable = document.documentElement.scrollHeight - window.innerHeight;
        if (totalScrollable <= 0) return;

        const minY = window.innerHeight * 0.14;
        const maxY = window.innerHeight * 0.82;
        const trackSpan = maxY - minY;

        if (trackSpan <= 0) return;

        const ratio = (clientY - minY) / trackSpan;
        const clampedRatio = Math.min(Math.max(ratio, 0), 1);
        const targetScrollY = clampedRatio * totalScrollable;

        window.scrollTo({
            top: targetScrollY,
            behavior: 'instant',
        });
    }, []);

    // Mouse & Touch Drag Handlers
    const startDrag = (clientY) => {
        isDraggingRef.current = true;
        setIsDragging(true);
        setIsScrolling(true);
        dragStartYRef.current = clientY;
        document.body.classList.add('toy-car-dragging-active');
        scrollToClientY(clientY);
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        startDrag(e.clientY);
    };

    const handleTouchStart = (e) => {
        if (e.touches && e.touches[0]) {
            startDrag(e.touches[0].clientY);
        }
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            e.preventDefault();
            scrollToClientY(e.clientY);
        };

        const handleTouchMove = (e) => {
            if (!isDraggingRef.current || !e.touches || !e.touches[0]) return;
            scrollToClientY(e.touches[0].clientY);
        };

        const stopDrag = () => {
            if (isDraggingRef.current) {
                isDraggingRef.current = false;
                setIsDragging(false);
                setIsScrolling(false);
                setScrollDirection('idle');
                document.body.classList.remove('toy-car-dragging-active');
            }
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: false });
        window.addEventListener('mouseup', stopDrag);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', stopDrag);
        window.addEventListener('touchcancel', stopDrag);

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', stopDrag);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', stopDrag);
            window.removeEventListener('touchcancel', stopDrag);
        };
    }, [scrollToClientY]);

    // Track click-to-jump
    const handleTrackClick = (e) => {
        if (!isDraggingRef.current) {
            scrollToClientY(e.clientY);
        }
    };

    // Trigger confetti celebration when reaching bottom of page
    const triggerConfettiBurst = () => {
        try {
            confetti({
                particleCount: 50,
                spread: 60,
                origin: { x: 0.95, y: 0.9 },
                colors: ['#8c52ff', '#ffd615', '#f97316', '#3b82f6', '#ec4899'],
                disableForReducedMotion: true,
            });
        } catch (e) {
            console.log('Confetti triggered', e);
        }
    };

    // Smooth scroll back to top when car is double clicked or clicked near top
    const handleCarClick = (e) => {
        if (!isDraggingRef.current && scrollProgress < 0.1) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth',
            });
        }
    };

    // Map scroll percentage (0 to 1) to vertical position in viewport (14% to 82% of screen height)
    const carTopPercent = 14 + scrollProgress * 68;

    // Tilt angle based on direction
    const tiltAngle = scrollDirection === 'down' ? 8 : scrollDirection === 'up' ? -8 : 0;

    return (
        <aside className="toy-car-scroll-wrapper" aria-label="Scroll position indicator">
            {/* Background glowing track line (clickable to jump scroll) */}
            <div className="toy-car-track-line" onClick={handleTrackClick}>
                <div 
                    className="toy-car-track-progress"
                    style={{ height: `${scrollProgress * 100}%` }}
                />
            </div>

            {/* Floating Draggable Car Container */}
            <div
                className={`toy-car-container ${isScrolling ? 'is-driving' : 'is-idle'} ${isHovered ? 'is-hovered' : ''} ${isDragging ? 'is-dragging' : ''}`}
                style={{
                    top: `${carTopPercent}%`,
                    transform: `translateY(-50%) rotate(${tiltAngle}deg)`,
                }}
                onMouseDown={handleMouseDown}
                onTouchStart={handleTouchStart}
                onClick={handleCarClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                title="Hold & Drag to scroll, or click track! 🚀"
            >
                {/* Tooltip */}
                <div className={`toy-car-tooltip ${isHovered && !isDragging ? 'visible' : ''}`}>
                    <span>Hold &amp; Drag to Scroll 🚀</span>
                    <div className="tooltip-arrow" />
                </div>

                {/* Dust particles emitted behind car when scrolling */}
                {isScrolling && scrollDirection === 'down' && (
                    <div className="car-dust-particles">
                        <span className="particle particle-1" />
                        <span className="particle particle-2" />
                        <span className="particle particle-3" />
                    </div>
                )}

                {/* Headlight Beam effect when driving down */}
                {isScrolling && scrollDirection === 'down' && (
                    <div className="car-headlight-beam" />
                )}

                {/* Drop shadow underneath car */}
                <div className="toy-car-shadow" />

                {/* 3D Toy Car SVG Artwork */}
                <div className="toy-car-svg-frame">
                    <svg
                        width="64"
                        height="40"
                        viewBox="0 0 64 40"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="toy-car-svg"
                    >
                        <defs>
                            {/* Metallic Body Gradient */}
                            <linearGradient id="carBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor={isHovered || isDragging ? '#ffd615' : '#8c52ff'} />
                                <stop offset="50%" stopColor={isHovered || isDragging ? '#f97316' : '#7b46e5'} />
                                <stop offset="100%" stopColor={isHovered || isDragging ? '#ea580c' : '#5b21b6'} />
                            </linearGradient>

                            {/* Windshield Reflection */}
                            <linearGradient id="glassGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#e0f2fe" stopOpacity="0.9" />
                                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.7" />
                            </linearGradient>

                            {/* Wheel Rim Metallic */}
                            <linearGradient id="rimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#f8fafc" />
                                <stop offset="100%" stopColor="#94a3b8" />
                            </linearGradient>
                        </defs>

                        {/* Car Chassis / Shadow Base */}
                        <rect x="6" y="24" width="52" height="6" rx="3" fill="#1e1b4b" opacity="0.4" />

                        {/* Main Roof & Cabin */}
                        <path
                            d="M18 18 C22 10, 38 10, 44 18 L52 20 C54 20, 56 22, 56 24 L8 24 C8 22, 10 20, 14 20 Z"
                            fill="url(#carBodyGrad)"
                        />

                        {/* Windshield & Side Windows */}
                        <path
                            d="M22 17 C25 12, 35 12, 38 17 Z"
                            fill="url(#glassGrad)"
                        />
                        <path
                            d="M24 16 L27 13 L33 13 L31 16 Z"
                            fill="#ffffff"
                            opacity="0.6"
                        />

                        {/* Car Main Fenders & Body Hood */}
                        <path
                            d="M4 23 C4 19, 10 18, 18 18 L46 18 C54 18, 60 19, 60 23 L60 27 C60 28.5, 58.5 30, 57 30 L7 30 C5.5 30, 4 28.5, 4 27 Z"
                            fill="url(#carBodyGrad)"
                        />

                        {/* Racing Stripe Accent Line */}
                        <path
                            d="M6 24 L58 24"
                            stroke={isHovered || isDragging ? '#ffffff' : '#ffd615'}
                            strokeWidth="2"
                            strokeLinecap="round"
                        />

                        {/* Front Bumper & Headlights */}
                        <circle cx="57" cy="22" r="2.5" fill="#fef08a" />
                        <circle cx="57" cy="22" r="1.5" fill="#ffffff" />
                        {/* Rear Tail Light */}
                        <rect x="4" y="21" width="3" height="4" rx="1.5" fill="#ef4444" />

                        {/* Rear Wheel Container */}
                        <g transform="translate(16, 28)">
                            <circle cx="0" cy="0" r="7.5" fill="#0f172a" />
                            <circle cx="0" cy="0" r="5" fill="url(#rimGrad)" />
                            {/* Rotating Spokes */}
                            <g transform={`rotate(${wheelRotation})`}>
                                <line x1="-4" y1="0" x2="4" y2="0" stroke="#334155" strokeWidth="1.5" />
                                <line x1="0" y1="-4" x2="0" y2="4" stroke="#334155" strokeWidth="1.5" />
                            </g>
                        </g>

                        {/* Front Wheel Container */}
                        <g transform="translate(48, 28)">
                            <circle cx="0" cy="0" r="7.5" fill="#0f172a" />
                            <circle cx="0" cy="0" r="5" fill="url(#rimGrad)" />
                            {/* Rotating Spokes */}
                            <g transform={`rotate(${wheelRotation})`}>
                                <line x1="-4" y1="0" x2="4" y2="0" stroke="#334155" strokeWidth="1.5" />
                                <line x1="0" y1="-4" x2="0" y2="4" stroke="#334155" strokeWidth="1.5" />
                            </g>
                        </g>
                    </svg>
                </div>
            </div>
        </aside>
    );
}

export default ToyCarScrollIndicator;
