const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { doc, getDoc, updateDoc, collection, addDoc } = require('firebase/firestore');

// POST /api/feedback - Submit customer review and update worker rating
router.post('/', async (req, res) => {
    try {
        const { bookingId, workerId, rating, reviewText, reviewerName } = req.body;

        if (!bookingId || !workerId || !rating) {
            return res.status(400).json({ message: 'Missing required feedback data' });
        }

        console.log(`\n⭐ [FEEDBACK] New Review for Worker ${workerId} (Booking: ${bookingId})`);

        // 1. Update Booking Status to 'completed'
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);
        if (!bookingSnap.exists()) return res.status(404).json({ message: 'Booking not found' });
        
        const bookingData = bookingSnap.data();
        await updateDoc(bookingRef, { status: 'completed' });

        // 2. Save to Reviews Collection
        const reviewData = {
            workerId,
            rating: Number(rating),
            reviewText: reviewText || '',
            reviewerName: reviewerName || 'Anonymous',
            service: bookingData.serviceType || 'general',
            createdAt: new Date().toISOString()
        };
        await addDoc(collection(db, 'reviews'), reviewData);

        // 3. Update Worker Stats (Average Rating & Total Jobs)
        const workerRef = doc(db, 'workers', workerId);
        const workerSnap = await getDoc(workerRef);
        
        if (workerSnap.exists()) {
            const workerData = workerSnap.data();
            const currentRating = Number(workerData.rating) || 5.0;
            const currentJobs = Number(workerData.totalJobs) || 0;
            
            // Calculate New Average Rating
            // New Average = ((Old Average * Old Jobs) + New Rating) / (Old Jobs + 1)
            const newTotalJobs = currentJobs + 1;
            const newAverageRating = ((currentRating * currentJobs) + Number(rating)) / newTotalJobs;
            
            await updateDoc(workerRef, {
                rating: Number(newAverageRating.toFixed(1)),
                totalJobs: newTotalJobs
            });
            
            console.log(`✅ [FEEDBACK] Worker stats updated: Rating -> ${newAverageRating.toFixed(1)}, Jobs -> ${newTotalJobs}`);
        }

        res.status(200).json({ message: 'Feedback submitted successfully' });
    } catch (error) {
        console.error('❌ [FEEDBACK] Error processing feedback:', error);
        res.status(500).json({ message: 'Error processing feedback', details: error.message });
    }
});

module.exports = router;
