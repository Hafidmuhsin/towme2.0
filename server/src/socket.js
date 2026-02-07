
const socketHandler = (io) => {
    io.on('connection', (socket) => {
        // console.log(`User Connected: ${socket.id}`);

        // 1. User/Provider joins their personal room for direct messages
        socket.on('join_user_room', (userId) => {
            socket.join(userId);
            // console.log(`User ${userId} joined personal room`);
        });

        // 2. Provider goes online (Could be used to broadcast availability)
        socket.on('provider_online', (providerId) => {
            socket.join('active_providers');
        });

        // 3. Customer Creates Request -> Emitted from Client or Controller
        // If client emits directly:
        socket.on('new_request_client', (requestData) => {
            // Broadcast to all active providers (Simple MVP)
            // In prod: Query GeoJSON and valid providers
            socket.to('active_providers').emit('new_job_available', requestData);
        });

        // 4. Provider Accepts Request -> Client Emits
        socket.on('accept_request', ({ requestId, customerId, providerData }) => {
            // Notify specific customer
            io.to(customerId).emit('request_accepted', { requestId, provider: providerData });

            // Both join a unique "job room"
            socket.join(`job_${requestId}`);
            // Force/Invite customer to join via event (or handled on frontend)
        });

        // 5. Customer Joins Job Room (on dashboard when active)
        socket.on('join_job_room', (requestId) => {
            socket.join(`job_${requestId}`);
        });

        // 6. Live Location Stream (Provider -> Job Room)
        socket.on('provider_location_update', ({ requestId, location }) => {
            // Broadcast to everyone in job room (mainly customer)
            socket.to(`job_${requestId}`).emit('live_location', location);
        });

        // 7. Status Updates (Arrived, Completed, Paid, etc)
        socket.on('status_change', ({ requestId, status, customerId }) => {
            // console.log(`Status Change: Job ${requestId} -> ${status}`);
            io.to(`job_${requestId}`).emit('status_changed', status);
            io.to(customerId).emit('status_changed', status);
        });

        // 8. Cancel Request
        socket.on('cancel_request', ({ requestId, customerId }) => {
            io.to(`job_${requestId}`).emit('status_changed', 'cancelled');
            io.to(customerId).emit('status_changed', 'cancelled');
        });

        // 9. Complete Request (Legacy/Specific)
        socket.on('complete_request', ({ requestId, customerId }) => {
            io.to(`job_${requestId}`).emit('status_changed', 'completed');
            io.to(customerId).emit('status_changed', 'completed');
        });

        socket.on('disconnect', () => {
            // Handle offline status
        });
    });
};

export default socketHandler;
