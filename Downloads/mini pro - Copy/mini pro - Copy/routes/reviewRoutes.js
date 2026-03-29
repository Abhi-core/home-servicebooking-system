const express = require('express');
const router = express.Router();
const { db } = require('../config/firebase');
const { collection, addDoc, getDocs, query, orderBy } = require('firebase/firestore');

// GET /api/reviews
router.get('/', async (req, res) => {
    try {
        const reviewsRef = collection(db, 'reviews');
        const q = query(reviewsRef, orderBy('createdAt', 'desc'));
        const snapshot = await getDocs(q);
        
        const reviews = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        res.status(200).json(reviews);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// POST /api/reviews
router.post('/', async (req, res) => {
    try {
        const { reviewerName, service, rating, reviewText } = req.body;

        if (!reviewerName || !service || !rating || !reviewText) {
            return res.status(400).json({ message: 'Missing required fields' });
        }

        const reviewData = {
            reviewerName,
            service,
            rating,
            reviewText,
            createdAt: new Date().toISOString()
        };

        const docRef = await addDoc(collection(db, 'reviews'), reviewData);
        res.status(201).json({ id: docRef.id, ...reviewData });
    } catch (error) {
        console.error('Error submitting review:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

module.exports = router;
