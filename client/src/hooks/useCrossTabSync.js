import { useEffect } from 'react';

export const useCrossTabSync = (channelName, onMessageCallback) => {
    useEffect(() => {
        // Init HTML5 BroadcastChannel
        const channel = new BroadcastChannel(channelName);

        channel.onmessage = (event) => {
            onMessageCallback(event.data);
        };

        // Cleanup on unmount
        return () => channel.close();
    }, [channelName, onMessageCallback]);

    // Expose emit so components can blast events horizontally across tabs
    const emit = (data) => {
        const channel = new BroadcastChannel(channelName);
        channel.postMessage(data);
        channel.close();
    };

    return { emit };
};

export default useCrossTabSync;
