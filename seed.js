const { db } = require('./config/firebase');
const { collection, addDoc, getDocs, query, where } = require('firebase/firestore');

const seedWorkers = async () => {
    try {
        const workersRef = collection(db, 'workers');
        const snapshot = await getDocs(workersRef);
        
        if (snapshot.empty) {
            console.log('Seeding initial workers...');
            const workers = [
                { name: 'John Doe', serviceType: 'plumbing', rating: 4.8, available: true, email: 'john.plumber@example.com', totalJobs: 156 },
                { name: 'Alice Smith', serviceType: 'electrical', rating: 4.9, available: true, email: 'alice.electric@example.com', totalJobs: 210 },
                { name: 'Bob Wilson', serviceType: 'cleaning', rating: 4.7, available: true, email: 'bob.cleaner@example.com', totalJobs: 89 },
                { name: 'Charlie Brown', serviceType: 'carpentry', rating: 4.6, available: true, email: 'charlie.carpenter@example.com', totalJobs: 124 },
                { name: 'David Lee', serviceType: 'appliance', rating: 4.8, available: true, email: 'david.appliance@example.com', totalJobs: 67 },
                { name: 'Eve Garden', serviceType: 'car-wash', rating: 4.9, available: true, email: 'eve.carwash@example.com', totalJobs: 45 },
                { name: 'Frank Waste', serviceType: 'garbage', rating: 4.5, available: true, email: 'frank.garbage@example.com', totalJobs: 32 },
                { name: 'Sophia Chen', serviceType: 'plumbing', rating: 3.9, available: true, email: 'sophia@example.com', totalJobs: 12 },
                { name: 'Liam Neeson', serviceType: 'carpentry', rating: 5.0, available: true, email: 'liam@example.com', totalJobs: 450 },
                { name: 'Robert Downey', serviceType: 'electrical', rating: 4.2, available: true, email: 'robert@example.com', totalJobs: 78 },
                { name: 'Gal Gadot', serviceType: 'cleaning', rating: 4.9, available: true, email: 'gal@example.com', totalJobs: 134 },
                { name: 'Chris Evans', serviceType: 'appliance', rating: 4.4, available: true, email: 'chris@example.com', totalJobs: 56 }
            ];

            for (const worker of workers) {
                await addDoc(workersRef, worker);
            }
            console.log('Workers seeded successfully!');
        } else {
            console.log('Workers already exist.');
        }
    } catch (error) {
        console.error('Error seeding workers:', error);
    }
};

module.exports = { seedWorkers };
