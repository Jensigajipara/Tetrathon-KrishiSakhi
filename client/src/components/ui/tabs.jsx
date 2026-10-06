import React, { createContext, useContext, useState, useEffect } from 'react';

const TabsContext = createContext(null);

export const Tabs = ({ defaultValue, value, onValueChange, children, className = '' }) => {
  const [activeTab, setActiveTab] = useState(value || defaultValue);

  useEffect(() => {
    if (value !== undefined) {
      setActiveTab(value);
    }
  }, [value]);

  const selectTab = (val) => {
    setActiveTab(val);
    if (onValueChange) onValueChange(val);
  };

  return (
    <TabsContext.Provider value={{ activeTab, selectTab }}>
      <div className={`w-full ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children, className = '' }) => {
  return (
    <div className={`inline-flex items-center justify-start rounded-lg bg-slate-100 p-1 text-slate-500 gap-1 ${className}`}>
      {children}
    </div>
  );
};

export const TabsTrigger = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsTrigger must be used inside a Tabs component');

  const { activeTab, selectTab } = context;
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      onClick={() => selectTab(value)}
      className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 cursor-pointer ${
        isActive 
          ? 'bg-white text-slate-950 shadow-sm font-semibold' 
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const TabsContent = ({ value, children, className = '' }) => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('TabsContent must be used inside a Tabs component');

  const { activeTab } = context;
  const isActive = activeTab === value;

  if (!isActive) return null;

  return (
    <div className={`mt-4 focus-visible:outline-none ${className}`}>
      {children}
    </div>
  );
};
