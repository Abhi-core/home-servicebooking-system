const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { collection, getDocs, query, orderBy, doc, getDoc, updateDoc, deleteDoc, addDoc, where } = require('firebase/firestore');
const { sendBookingEmails } = require('../services/emailService');

// GET /api/admin/bookings
router.get('/bookings', async (req, res) => {
    try {
        console.log('\n📊 [ADMIN] Fetching Bookings...');
        const bookingsRef = collection(db, 'bookings');
        const snapshot = await getDocs(bookingsRef);
        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ [ADMIN] Fetched ${bookings.length} bookings.`);
        res.json(bookings);
    } catch (error) {
        console.error('❌ [ADMIN] Bookings fetch error:', error);
        res.status(500).json({ message: 'Error fetching bookings', details: error.message });
    }
});

// GET /api/admin/workers
router.get('/workers', async (req, res) => {
    try {
        console.log('\n👷 [ADMIN] Fetching Workers...');
        const workersRef = collection(db, 'workers');
        const snapshot = await getDocs(workersRef);
        const workers = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ [ADMIN] Fetched ${workers.length} workers.`);
        res.json(workers);
    } catch (error) {
        console.error('❌ [ADMIN] Workers fetch error:', error);
        res.status(500).json({ message: 'Error fetching workers', details: error.message });
    }
});

// POST /api/admin/workers
router.post('/workers', async (req, res) => {
    try {
        const { name, serviceType, rating, available, email } = req.body;
        console.log(`\n➕ [ADMIN] Adding Worker: ${name} (${email})`);
        
        if (!name || !serviceType || !email) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const newWorker = {
            name,
            serviceType,
            rating: Number(rating) || 5.0,
            available: available !== undefined ? available : true,
            email,
            joinedAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'workers'), newWorker);
        console.log(`✅ [ADMIN] Worker added, ID: ${docRef.id}`);
        res.status(201).json({ id: docRef.id, ...newWorker });
    } catch (error) {
        console.error('❌ [ADMIN] Add worker error:', error);
        res.status(500).json({ message: 'Error adding worker', details: error.message });
    }
});

// DELETE /api/admin/workers/:id
router.delete('/workers/:id', async (req, res) => {
    try {
        const workerId = req.params.id;
        console.log(`\n🗑️ [ADMIN] Deleting Worker: ${workerId}`);
        await deleteDoc(doc(db, 'workers', workerId));
        res.status(200).json({ message: 'Worker deleted successfully' });
    } catch (error) {
        console.error('❌ [ADMIN] Delete worker error:', error);
        res.status(500).json({ message: 'Error deleting worker', details: error.message });
    }
});

// GET /api/admin/worker-requests
router.get('/worker-requests', async (req, res) => {
    try {
        console.log('\n📝 [ADMIN] Fetching Registration Requests...');
        const requestsRef = collection(db, 'worker_requests');
        const q = query(requestsRef, where('status', '==', 'pending'));
        const snapshot = await getDocs(q);
        const requests = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        console.log(`✅ [ADMIN] Fetched ${requests.length} requests.`);
        res.json(requests);
    } catch (error) {
        console.error('❌ [ADMIN] Request fetch error:', error);
        res.status(500).json({ message: 'Error fetching worker requests', details: error.message });
    }
});

// POST /api/admin/worker-requests/:id/approve
router.post('/worker-requests/:id/approve', async (req, res) => {
    try {
        const requestId = req.params.id;
        console.log(`\n✅ [ADMIN] Approving Request: ${requestId}`);
        const requestRef = doc(db, 'worker_requests', requestId);
        const requestSnap = await getDoc(requestRef);

        if (!requestSnap.exists()) {
            return res.status(404).json({ message: 'Request not found' });
        }

        const requestData = requestSnap.data();

        const newWorker = {
            name: requestData.name,
            email: requestData.email,
            serviceType: requestData.serviceType,
            rating: 5.0,
            available: true,
            totalJobs: 0,
            joinedAt: new Date().toISOString()
        };

        const workerRef = await addDoc(collection(db, 'workers'), newWorker);
        await updateDoc(requestRef, { status: 'approved', approvedAt: new Date().toISOString() });

        console.log(`✅ [ADMIN] Request approved, Worker ID: ${workerRef.id}`);
        res.json({ message: 'Worker approved successfully', workerId: workerRef.id });
    } catch (error) {
        console.error('❌ [ADMIN] Approval error:', error);
        res.status(500).json({ message: 'Error approving worker', details: error.message });
    }
});

// POST /api/admin/bookings/:id/resend-email
router.post('/bookings/:id/resend-email', async (req, res) => {
    try {
        const bookingId = req.params.id;
        console.log(`\n📧 [ADMIN] Resending Email for Booking: ${bookingId}`);
        
        const bookingRef = doc(db, 'bookings', bookingId);
        const bookingSnap = await getDoc(bookingRef);

        if (!bookingSnap.exists()) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        const bookingData = bookingSnap.data();
        let assignedWorker = null;

        if (bookingData.workerId) {
            const workerRef = doc(db, 'workers', bookingData.workerId);
            const workerSnap = await getDoc(workerRef);
            if (workerSnap.exists()) {
                assignedWorker = { id: workerSnap.id, ...workerSnap.data() };
            }
        }

        const emailSuccess = await sendBookingEmails(bookingData, assignedWorker);
        
        // Update document with new email status
        await updateDoc(bookingRef, { emailSent: emailSuccess });

        if (emailSuccess) {
            res.json({ message: 'Email resent successfully' });
        } else {
            res.status(500).json({ message: 'Failed to resend email' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error resending email', details: error.message });
    }
});

// GET /api/admin/bookings/export - Export bookings to Excel
router.get('/bookings/export', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        console.log(`\n📋 [ADMIN] Exporting Bookings: ${startDate} to ${endDate}`);
        
        const bookingsRef = collection(db, 'bookings');
        let snapshot;
        
        if (startDate && endDate) {
            const q = query(bookingsRef, where('date', '>=', startDate), where('date', '<=', endDate));
            snapshot = await getDocs(q);
        } else {
            snapshot = await getDocs(bookingsRef);
        }

        const bookings = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const XLSX = require('xlsx');

        // Prepare data with Worker Name for better readability
        const data = await Promise.all(bookings.map(async b => {
            let workerName = 'Unassigned';
            if (b.workerId) {
                const wSnap = await getDoc(doc(db, 'workers', b.workerId));
                if (wSnap.exists()) workerName = wSnap.data().name;
            }

            return {
                'Customer': b.name,
                'Phone': b.phone,
                'Email': b.email,
                'Service': b.serviceType,
                'Date': b.date,
                'Time': b.time,
                'Address': b.address,
                'Status': (b.status || 'Confirmed').toUpperCase(),
                'Professional': workerName
            };
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, 'Service Logs');
        
        const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Disposition', `attachment; filename="fixit_export_${startDate || 'all'}.xlsx"`);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.send(buffer);
        
    } catch (error) {
        console.error('❌ [ADMIN] Export error:', error);
        res.status(500).json({ message: 'Error exporting bookings', details: error.message });
    }
});

module.exports = router;
