import { useState, useEffect } from 'react';

/**
 * Custom hook to track the user's online/offline status.
 * @returns {boolean} `true` if online, `false` if offline.
 */
export const useOnlineStatus = (): boolean => {
    // Initialize state with the current online status
    const [isOnline, setIsOnline] = useState(() => navigator.onLine);

    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Add event listeners for online/offline events
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        // Cleanup function to remove event listeners
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []); // Empty dependency array ensures this effect runs only once on mount

    return isOnline;
};
