import React, { createContext, useContext, useState, useCallback } from 'react';

const RefreshContext = createContext({
    refresh: 0,
    triggerRefresh: () => { },
});

export const useRefresh = () => useContext(RefreshContext);

export const RefreshProvider = ({ children }: { children: React.ReactNode }) => {
    const [refresh, setRefresh] = useState(0);

    const triggerRefresh = useCallback(() => {
        setRefresh(r => r + 1);
    }, []);

    return (
        <RefreshContext.Provider value={{ refresh, triggerRefresh }}>
            {children}
        </RefreshContext.Provider>
    );
};