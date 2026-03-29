const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, getDoc, query, where, limit, updateDoc, doc } = require('firebase/firestore');
const { sendBookingEmails } = require('../services/emailService');

// POST /api/book
router.post('/', async (req, res) => {
    try {
        const { name, phone, email, serviceType, address, date, time } = req.body;
        
        console.log(`\n🛎️ New Booking Request received: ${serviceType} for ${name}`);

        if (!name || !phone || !email || !serviceType || !address || !date || !time) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        console.log('Searching for available worker...');
        const workersRef = collection(db, 'workers');
        const q = query(workersRef, where('serviceType', '==', serviceType), where('available', '==', true), limit(1));
        const workerSnapshot = await getDocs(q);
        console.log('Worker search completed.');
        
        let assignedWorker = null;
        if (!workerSnapshot.empty) {
            assignedWorker = { id: workerSnapshot.docs[0].id, ...workerSnapshot.docs[0].data() };
            console.log('Worker assigned:', assignedWorker.name);
        }

        const bookingData = {
            name,
            phone,
            email,
            serviceType,
            address,
            date,
            time,
            status: 'confirmed',
            workerId: assignedWorker ? assignedWorker.id : null,
            createdAt: new Date().toISOString()
        };

        console.log('Saving booking to Firestore...');
        const docRef = await addDoc(collection(db, 'bookings'), bookingData);
        console.log('Booking saved, ID:', docRef.id);
        
        // Send Emails and wait for result
        console.log('Dispatching emails...');
        const emailSuccess = await sendBookingEmails(bookingData, assignedWorker);
        console.log('Emails dispatched, success:', emailSuccess);
        
        // Update document with email status
        const bookingRef = doc(db, 'bookings', docRef.id);
        await updateDoc(bookingRef, { emailSent: emailSuccess });

        res.status(201).json({ 
            message: 'Booking successful', 
            bookingId: docRef.id,
            worker: assignedWorker,
            emailSent: emailSuccess
        });
    } catch (error) {
        console.error('Booking error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// GET /api/book/:id - Get specific booking detail (for feedback page)
router.get('/:id', async (req, res) => {
    try {
        const docRef = doc(db, 'bookings', req.params.id);
        const snap = await getDoc(docRef);
        if (!snap.exists()) return res.status(404).json({ message: 'Booking not found' });
        
        const data = snap.data();
        let workerName = 'Our Professional';
        if (data.workerId) {
            const wSnap = await getDoc(doc(db, 'workers', data.workerId));
            if (wSnap.exists()) workerName = wSnap.data().name;
        }

        res.json({ id: snap.id, ...data, workerName });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
