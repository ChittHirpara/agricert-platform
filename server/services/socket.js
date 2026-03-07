const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');

let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // Auth middleware for Socket.IO
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;
        if (!token) return next(new Error('Authentication error'));
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.user;
            next();
        } catch (err) {
            next(new Error('Authentication error'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

        // Join auction room
        socket.on('joinAuction', (batchId) => {
            const room = `auction_${batchId}`;
            socket.join(room);
            console.log(`User ${socket.user.id} joined room ${room}`);
            socket.emit('message', { msg: `Joined auction room for batch ${batchId}` });
        });

        // Place bid in real-time
        socket.on('placeBid', async (data) => {
            try {
                const { auctionId, batchId, amount } = data;
                const auction = await Auction.findById(auctionId);

                if (!auction || auction.status !== 'active') {
                    return socket.emit('error', { msg: 'Auction is not active' });
                }

                if (amount <= auction.highestBid && amount <= auction.startingPrice) {
                    return socket.emit('error', { msg: `Bid must be higher than ${auction.highestBid || auction.startingPrice}` });
                }

                // Save bid
                const bid = new Bid({
                    auctionId,
                    bidderId: socket.user.id,
                    amount
                });
                await bid.save();

                // Update auction
                auction.highestBid = amount;
                auction.winner = socket.user.id;
                await auction.save();

                // Broadcast to all clients in room
                const room = `auction_${batchId}`;
                io.to(room).emit('bidUpdate', {
                    auctionId,
                    batchId,
                    highestBid: amount,
                    bidderId: socket.user.id,
                    timestamp: new Date()
                });

            } catch (err) {
                console.error('placeBid error:', err);
                socket.emit('error', { msg: 'Failed to place bid' });
            }
        });

        // End auction via socket
        socket.on('auctionEnd', async (data) => {
            try {
                const { auctionId, batchId } = data;
                const auction = await Auction.findById(auctionId);
                if (!auction) return;

                auction.status = 'completed';
                await auction.save();

                const room = `auction_${batchId}`;
                io.to(room).emit('auctionEnd', {
                    auctionId,
                    winner: auction.winner,
                    highestBid: auction.highestBid
                });
            } catch (err) {
                console.error('auctionEnd error:', err);
            }
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) throw new Error('Socket.IO not initialized');
    return io;
};

module.exports = { initSocket, getIO };
