import React from 'react';

export const Input = React.forwardRef(({ 
  label, 
  error, 
  type = 'text', 
  className = '', 
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={`block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all placeholder-slate-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none disabled:opacity-50 disabled:bg-slate-50 ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';
export default Input;
