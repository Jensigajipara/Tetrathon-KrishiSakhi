import React from 'react';

export const Card = React.forwardRef(({ className = '', ...props }, ref) => (
  <div
    ref={ref}
    className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden ${className}`}
    {...props}
  />
));
Card.displayName = 'Card';

export const CardHeader = ({ className = '', ...props }) => (
  <div className={`p-6 pb-4 space-y-1.5 ${className}`} {...props} />
);
CardHeader.displayName = 'CardHeader';

export const CardTitle = ({ className = '', ...props }) => (
  <h3 className={`text-lg font-semibold leading-none tracking-tight text-slate-900 ${className}`} {...props} />
);
CardTitle.displayName = 'CardTitle';

export const CardDescription = ({ className = '', ...props }) => (
  <p className={`text-sm text-slate-500 ${className}`} {...props} />
);
CardDescription.displayName = 'CardDescription';

export const CardContent = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 ${className}`} {...props} />
);
CardContent.displayName = 'CardContent';

export const CardFooter = ({ className = '', ...props }) => (
  <div className={`p-6 pt-0 flex items-center border-t border-slate-100 mt-4 ${className}`} {...props} />
);
CardFooter.displayName = 'CardFooter';
