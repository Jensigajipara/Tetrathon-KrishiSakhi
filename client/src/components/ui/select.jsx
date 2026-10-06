import React from 'react';

export const Select = React.forwardRef(({ 
  label, 
  error, 
  className = '', 
  children, 
  ...props 
}, ref) => {
  return (
    <div className="w-full space-y-1">
      {label && (
        <label className="block text-xs font-medium text-slate-700 tracking-wide uppercase">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          ref={ref}
          className={`block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 transition-all placeholder-slate-400 focus:border-green-600 focus:ring-1 focus:ring-green-600 focus:outline-none disabled:opacity-50 disabled:bg-slate-50 cursor-pointer appearance-none ${className}`}
          {...props}
        >
          {children}
        </select>
        {/* Custom chevron dropdown icon */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
          <svg className="h-4 w-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-xs text-red-500 font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';
export default Select;
