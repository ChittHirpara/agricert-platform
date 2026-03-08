const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const Auction = require('../models/Auction');
const Bid = require('../models/Bid');
const Batch = require('../models/Batch');

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
        if (!token) {
            console.error('[Socket] No token provided in handshake');
            return next(new Error('Authentication error - No token'));
        }
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            socket.user = decoded.user;
            console.log(`[Socket] Auth Success: ${socket.user.id} (${socket.user.role})`);
            next();
        } catch (err) {
            console.error('[Socket] Token verification failed:', err.message);
            next(new Error('Authentication error - Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id} | User: ${socket.user.id}`);

        // Join auction room and send initial state
        socket.on('joinAuction', async (id) => {
            console.log(`[Socket] User ${socket.user.id} attempting to sync ID: ${id}`);

            try {
                // Ensure ID format is valid
                if (!id || id.length !== 24) {
                    console.error(`[Socket] Invalid ID format: ${id}`);
                    return socket.emit('auctionState', { status: 'error', error: 'Invalid ID Format' });
                }

                // Polymorphic Lookup: Try ID as Auction._id OR Auction.batchId
                let auction = await Auction.findOne({
                    $or: [{ _id: id }, { batchId: id }]
                }).populate('batchId');

                // If not found, try to auto-seed if it's a Batch ID
                if (!auction) {
                    console.log(`[Socket] No active auction for ${id}, searching batch archive...`);
                    const batch = await Batch.findById(id);
                    if (batch) {
                        auction = new Auction({
                            batchId: batch._id,
                            farmerId: batch.farmerId,
                            startingPrice: 500,
                            status: 'active'
                        });
                        await auction.save();
                        auction = await auction.populate('batchId'); // Populate for consistent room naming
                        console.log(`[Socket] Auto-seeded auction for batch: ${id}`);
                    } else {
                        console.warn(`[Socket] Batch/Auction not found for identifier: ${id}`);
                        return socket.emit('auctionState', { status: 'error', error: 'Identifier not found in ledger' });
                    }
                }

                if (auction) {
                    // Standardize the room name to always use the Batch ID
                    const actualBatchId = auction.batchId._id.toString();
                    const room = `auction_${actualBatchId}`;
                    socket.join(room);

                    const recentBids = await Bid.find({ auctionId: auction._id })
                        .sort({ createdAt: -1 })
                        .limit(10)
                        .lean();

                    const history = recentBids.map(b => ({
                        bidder: b.bidderId,
                        amount: b.amount,
                        time: b.createdAt
                    }));

                    const state = {
                        auctionId: auction._id, // Required for concluding the auction
                        highestBid: auction.highestBid || 0,
                        startingPrice: auction.startingPrice || 500,
                        highestBidder: auction.winner,
                        farmerId: auction.farmerId, // Expose farmer identity for ownership controls
                        status: auction.status || 'active',
                        history: history,
                        batchId: actualBatchId // Inform client of the standardized batchId
                    };

                    console.log(`[Socket] Sync Complete: User ${socket.user.id} -> Room ${room}`);
                    socket.emit('auctionState', state);
                }
            } catch (err) {
                console.error('[Socket] joinAuction failure:', err);
                socket.emit('auctionState', { status: 'error', error: 'Neural Processing Failure' });
            }
        });

        // Place bid in real-time
        socket.on('placeBid', async (data) => {
            try {
                const { batchId: id, amount } = data;

                // Polymorphic Lookup for bidding too
                const auction = await Auction.findOne({
                    $or: [{ _id: id }, { batchId: id }]
                });

                if (!auction || auction.status !== 'active') {
                    return socket.emit('bidError', { message: 'Auction is not active' });
                }

                if (amount <= auction.highestBid) {
                    return socket.emit('bidError', { message: `Bid must be higher than current highest bid: $${auction.highestBid}` });
                }

                if (amount < auction.startingPrice) {
                    return socket.emit('bidError', { message: `Bid must be at least the starting price: $${auction.startingPrice}` });
                }

                // Save bid
                const bid = new Bid({
                    auctionId: auction._id,
                    bidderId: socket.user.id,
                    amount
                });
                await bid.save();

                // Update auction
                auction.highestBid = amount;
                auction.winner = socket.user.id;
                await auction.save();

                // Broadcast to all clients in room
                // Use the batchId from the auction record to ensure consistency
                const room = `auction_${auction.batchId.toString()}`;
                console.log(`[Socket] Broadcasting bidUpdate: ${amount} to room: ${room}`);

                io.to(room).emit('bidUpdate', {
                    highestBid: amount,
                    highestBidder: socket.user.id,
                    timestamp: new Date()
                });

            } catch (err) {
                console.error('placeBid error:', err);
                socket.emit('bidError', { message: 'Failed to place bid' });
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
