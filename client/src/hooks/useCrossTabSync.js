import { useEffect, useCallback } from 'react';

export const useCrossTabSync = (channelName, onMessageCallback) => {
    useEffect(() => {
        const channel = new BroadcastChannel(channelName);

        channel.onmessage = (event) => {
            onMessageCallback(event.data);
        };

        return () => channel.close();
    }, [channelName, onMessageCallback]);

    const emit = useCallback((data) => {
        const channel = new BroadcastChannel(channelName);
        channel.postMessage(data);
        channel.close();
    }, [channelName]);

    return { emit };
};

export default useCrossTabSync;
