import React from 'react';
import { LogIn } from 'lucide-react';

function GuestLoginButton({ onClick }) {
  return (
    <button className="social-auth-btn guest-btn" type="button" onClick={onClick}>
      <LogIn size={18} />
      Continue as Guest
    </button>
  );
}

export default GuestLoginButton;
