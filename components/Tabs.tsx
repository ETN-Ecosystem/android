// FIX: Removed the old, conflicting and incomplete implementation of Tabs and Tab components.
import React, { useState, createContext, useContext, ReactNode } from 'react';

interface TabsSimpleContextType {
  activeIndex: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}
const TabsSimpleContext = createContext<TabsSimpleContextType | null>(null);

const useTabs = () => {
    const context = useContext(TabsSimpleContext);
    if (!context) {
        throw new Error('useTabs must be used within a Tabs provider');
    }
    return context;
}

export const TabsProvider: React.FC<{children: ReactNode}> = ({children}) => {
    const [activeIndex, setActiveIndex] = useState(0);
    return (
        <TabsSimpleContext.Provider value={{activeIndex, setActiveIndex}}>
            {children}
        </TabsSimpleContext.Provider>
    )
}

// Re-exporting Tabs as the provider
export { TabsProvider as Tabs };

export const Tab: React.FC<{index: number, children: ReactNode}> = ({index, children}) => {
    const { activeIndex, setActiveIndex } = useTabs();
    const isActive = activeIndex === index;
    
    return (
        <button
            onClick={() => setActiveIndex(index)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors duration-200 focus:outline-none ${
                isActive 
                ? 'text-white border-b-2 border-blue-500' 
                : 'text-gray-400 hover:text-white'
            }`}
        >
            {children}
        </button>
    )
}

export const TabPanel: React.FC<{index: number, children: ReactNode}> = ({index, children}) => {
    const { activeIndex } = useTabs();
    return activeIndex === index ? <div>{children}</div> : null;
}
