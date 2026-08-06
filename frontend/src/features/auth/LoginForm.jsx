import React from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { User, Mail, Lock } from 'lucide-react';
import './LoginForm.css';

// Validation Schemas
const signInSchema = yup.object().shape({
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const signUpSchema = yup.object().shape({
  firstName: yup.string().required('First name is required'),
  lastName: yup.string().required('Last name is required'),
  email: yup.string().email('Please enter a valid email').required('Email is required'),
  password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  confirmPassword: yup.string()
    .oneOf([yup.ref('password'), null], 'Passwords must match')
    .required('Confirm password is required'),
});

function LoginForm({ isSignUp, onSubmit, onSwitchAuth }) {
  const schema = isSignUp ? signUpSchema : signInSchema;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(schema),
    mode: 'onTouched'
  });

  React.useEffect(() => {
    reset();
  }, [isSignUp, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
      {isSignUp && (
        <div className="form-row-grid">
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <div className={`input-icon-wrapper ${errors.firstName ? 'input-error' : ''}`}>
              <User className="input-field-icon" size={18} />
              <input
                type="text"
                id="firstName"
                placeholder="Jane"
                {...register('firstName')}
              />
            </div>
            {errors.firstName && <span className="error-text">{errors.firstName.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <div className={`input-icon-wrapper ${errors.lastName ? 'input-error' : ''}`}>
              <User className="input-field-icon" size={18} />
              <input
                type="text"
                id="lastName"
                placeholder="Doe"
                {...register('lastName')}
              />
            </div>
            {errors.lastName && <span className="error-text">{errors.lastName.message}</span>}
          </div>
        </div>
      )}

      <div className="form-group">
        <label htmlFor="email">Email Address</label>
        <div className={`input-icon-wrapper ${errors.email ? 'input-error' : ''}`}>
          <Mail className="input-field-icon" size={18} />
          <input
            type="email"
            id="email"
            placeholder="collector@toyvault.com"
            {...register('email')}
          />
        </div>
        {errors.email && <span className="error-text">{errors.email.message}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className={`input-icon-wrapper ${errors.password ? 'input-error' : ''}`}>
          <Lock className="input-field-icon" size={18} />
          <input
            type="password"
            id="password"
            placeholder="••••••••"
            {...register('password')}
          />
        </div>
        {errors.password && <span className="error-text">{errors.password.message}</span>}
      </div>

      {isSignUp && (
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <div className={`input-icon-wrapper ${errors.confirmPassword ? 'input-error' : ''}`}>
            <Lock className="input-field-icon" size={18} />
            <input
              type="password"
              id="confirmPassword"
              placeholder="••••••••"
              {...register('confirmPassword')}
            />
          </div>
          {errors.confirmPassword && (
            <span className="error-text">{errors.confirmPassword.message}</span>
          )}
        </div>
      )}

      <button type="submit" className="submit-btn-3d">
        {isSignUp ? 'Sign Up' : 'Sign In'}
      </button>

      <div className="auth-switch-prompt">
        {isSignUp ? (
          <p>
            Already have an account?{' '}
            <button
              type="button"
              className="switch-auth-link"
              onClick={onSwitchAuth}
            >
              Login
            </button>
          </p>
        ) : (
          <p>
            Don't have an account?{' '}
            <button
              type="button"
              className="switch-auth-link"
              onClick={onSwitchAuth}
            >
              Sign Up
            </button>
          </p>
        )}
      </div>
    </form>
  );
}

export default LoginForm;
