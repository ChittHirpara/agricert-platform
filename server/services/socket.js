const socketIo = require('socket.io');
const auctionService = require('./auctionService');

const initSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "*", // Adjust for production
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`[Socket.io] New client connected: ${socket.id}`);

        // Join a specific product's auction room
        socket.on('joinRoom', (productId) => {
            const roomName = `auction_${productId}`;
            socket.join(roomName);
            console.log(`[Socket.io] Client joined room: ${roomName}`);

            // Send the current highest bid to the newly joined client
            const currentState = auctionService.getAuctionState(productId);
            socket.emit('auctionState', currentState);
        });

        // Leave room
        socket.on('leaveRoom', (productId) => {
            const roomName = `auction_${productId}`;
            socket.leave(roomName);
            console.log(`[Socket.io] Client left room: ${roomName}`);
        });

        // Handle new bids
        socket.on('placeBid', async (data) => {
            const { productId, amount, userId } = data;
            const roomName = `auction_${productId}`;

            try {
                const result = await auctionService.processBid(productId, amount, userId);

                if (result.isValid) {
                    // Broadcast to everyone in the room (including sender)
                    io.to(roomName).emit('bidUpdate', {
                        highestBid: result.highestBid,
                        highestBidder: result.highestBidder,
                        timestamp: new Date().toISOString()
                    });
                } else {
                    // Send error back to the originating client only
                    socket.emit('bidError', { message: result.error });
                }
            } catch (err) {
                socket.emit('bidError', { message: 'Internal Server Error processing bid.' });
            }
        });

        socket.on('disconnect', () => {
            console.log(`[Socket.io] Client disconnected: ${socket.id}`);
        });
    });

    return io;
};

module.exports = { initSocket };
