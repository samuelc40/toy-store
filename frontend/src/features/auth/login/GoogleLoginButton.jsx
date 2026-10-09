import React, { useState, useEffect, useRef } from "react";
import { GoogleLogin } from "@react-oauth/google";

function GoogleLoginButton({ onSuccess, onError }) {
  const containerRef = useRef(null);
  const [btnWidth, setBtnWidth] = useState(340);
  const [currentTheme, setCurrentTheme] = useState(() => {
    if (typeof document !== "undefined") {
      return document.documentElement.getAttribute("data-theme") || "light";
    }
    return "light";
  });

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const measuredWidth = containerRef.current.getBoundingClientRect().width;
        if (measuredWidth > 0) {
          // Google GSI button width constraint: 240px to 400px
          const clampedWidth = Math.min(Math.max(Math.floor(measuredWidth), 240), 400);
          setBtnWidth((prev) => (Math.abs(prev - clampedWidth) > 15 ? clampedWidth : prev));
        }
      }
    };

    updateWidth();

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined" && containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateWidth());
      resizeObserver.observe(containerRef.current);
    } else {
      window.addEventListener("resize", updateWidth);
    }

    const updateTheme = () => {
      const themeAttr =
        document.documentElement.getAttribute("data-theme") || "light";
      setCurrentTheme(themeAttr);
    };

    updateTheme();

    const themeObserver = new MutationObserver(updateTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", updateWidth);
      }
      themeObserver.disconnect();
    };
  }, []);

  return (
    <div className="google-login-btn-wrapper" ref={containerRef}>
      <GoogleLogin
        key={currentTheme}
        onSuccess={onSuccess}
        onError={onError}
        theme={currentTheme === "dark" ? "filled_black" : "outline"}
        size="large"
        shape="pill"
        text="continue_with"
        width={String(btnWidth)}
        logo_alignment="left"
      />
    </div>
  );
}

export default GoogleLoginButton;
