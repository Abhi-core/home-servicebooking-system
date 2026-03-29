const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, getDoc, query, where, orderBy, limit, doc, updateDoc } = require('firebase/firestore');

// POST /api/workers/register - Submit registration request
router.post('/register', async (req, res) => {
    try {
        const { name, email, serviceType, experience, bio } = req.body;

        if (!name || !email || !serviceType) {
            return res.status(400).json({ message: 'Name, email and service type are required' });
        }

        const requestData = {
            name,
            email,
            serviceType,
            experience: experience || 'Entry Level',
            bio: bio || '',
            status: 'pending',
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'worker_requests'), requestData);
        res.status(201).json({ message: 'Registration request submitted successfully', id: docRef.id });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error submitting registration' });
    }
});

// GET /api/workers/analytics/:email - Fetch worker performance
router.get('/analytics/:email', async (req, res) => {
    try {
        const email = req.params.email;
        console.log(`\n📊 [WORKER] Analytics Request: ${email}`);
        
        // 1. Get Worker Info
        const workersRef = collection(db, 'workers');
        const qWorker = query(workersRef, where('email', '==', email), limit(1));
        const workerSnap = await getDocs(qWorker);

        if (workerSnap.empty) {
            console.log(`❌ [WORKER] Worker not found for email: ${email}`);
            return res.status(404).json({ message: 'Worker not found in active professionals database.' });
        }

        const workerData = { id: workerSnap.docs[0].id, ...workerSnap.docs[0].data() };
        console.log(`✅ [WORKER] Worker Found: ${workerData.name} (Service: ${workerData.serviceType})`);

        // 2. Get Past Works
        const bookingsRef = collection(db, 'bookings');
        const qBookings = query(bookingsRef, where('workerId', '==', workerData.id));
        const bookingsSnap = await getDocs(qBookings);
        
        const works = bookingsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`📑 [WORKER] Bookings Found: ${works.length}`);

        // 3. Get Reviews
        const reviewsRef = collection(db, 'reviews');
        const qReviews = query(reviewsRef, where('service', '==', (workerData.serviceType || 'plumbing')), limit(10));
        const reviewsSnap = await getDocs(qReviews);
        const reviews = reviewsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`⭐ [WORKER] Reviews Found: ${reviews.length}`);

        res.json({
            worker: workerData,
            stats: {
                totalJobs: workerData.totalJobs || works.length,
                rating: workerData.rating || 5.0,
                completedJobs: works.length,
                performance: works.length > 5 ? "Exceeds Expectations" : (works.length > 2 ? "Solid Performer" : "Getting Started")
            },
            recentWorks: works.slice(0, 5),
            reviews: reviews
        });
    } catch (error) {
        console.error('❌ [WORKER] Analytics error details:', error);
        res.status(500).json({ 
            message: 'Worker Analytics Service Error', 
            details: error.message,
            stack: error.stack 
        });
    }
});

// PATCH /api/workers/:id/status - Update worker availability
router.patch('/:id/status', async (req, res) => {
    try {
        const { id } = req.params;
        const { available } = req.body;
        
        console.log(`\n🔄 [WORKER] Status Update: ${id} -> ${available}`);
        const workerRef = doc(db, 'workers', id);
        await updateDoc(workerRef, { available });
        
        res.json({ message: 'Status updated successfully', available });
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', details: error.message });
    }
});

// POST /api/workers/bookings/:bookingId/finish
router.post('/bookings/:bookingId/finish', async (req, res) => {
    try {
        const { bookingId } = req.params;
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) return res.status(404).json({ message: 'Booking not found' });
        
        const bookingData = { id: bookingSnap.id, ...bookingSnap.data() };
        if (bookingData.status !== 'confirmed') {
            return res.status(400).json({ message: 'Job is not in a confirmable status' });
        }

        // Update booking status
        await updateDoc(bookingRef, { status: 'finished' });

        // Get Worker Details for the email
        let workerData = null;
        if (bookingData.workerId) {
            const workerSnap = await getDoc(doc(db, 'workers', bookingData.workerId));
            if (workerSnap.exists()) workerData = { id: workerSnap.id, ...workerSnap.data() };
        }

        // Trigger Feedback Email
        const { sendFeedbackRequest } = require('../services/emailService');
        await sendFeedbackRequest(bookingData, workerData);

        res.json({ message: 'Job marked as finished. Feedback request sent.' });
    } catch (error) {
        console.error('Finish job error:', error);
        res.status(500).json({ message: 'Error finishing job' });
    }
});

// GET /api/workers/:id/bookings/export - Export worker's personal logs
router.get('/:id/bookings/export', async (req, res) => {
    try {
        const { id } = req.params;
        const { startDate, endDate } = req.query;
        console.log(`\n📋 [WORKER] Exporting Logs for ${id}: ${startDate} to ${endDate}`);
        
        const bookingsRef = collection(db, 'bookings');
        const q = query(
            bookingsRef, 
            where('workerId', '==', id),
            where('date', '>=', startDate),
            where('date', '<=', endDate)
        );
        
        const snapshot = await getDocs(q);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        const XLSX = require('xlsx');
        const data = bookings.map(b => ({
            'Customer': b.name,
            'Phone': b.phone,
            'Email': b.email,
            'Service': b.serviceType,
            'Date': b.date,
            'Time': b.time,
            'Address': b.address,
            'Status': (b.status || 'Confirmed').toUpperCase()
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'My Work History');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="my_service_logs.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (error) {
        console.error('❌ [WORKER] Export error:', error);
        res.status(500).json({ message: 'Error exporting logs' });
    }
});

module.exports = router;
