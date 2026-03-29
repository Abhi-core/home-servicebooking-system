const { sendBookingEmails } = require('./services/emailService');
require('dotenv').config();

// Standard test booking data
const testBooking = {
    name: 'Test User',
    email: 'abijithpb8113@gmail.com', // Recipient email
    serviceType: 'Plumbing',
    address: '123 Test Street',
    date: '2026-03-30',
    time: '10:00 AM',
    phone: '1234567890'
};

const testWorker = {
    name: 'Test Worker',
    email: 'abijithpb8113@gmail.com' // Recipient email
};

async function runTest() {
    console.log('🧪 Starting Email Send Test...');
    console.log(`📧 Using Email User: ${process.env.EMAIL_USER}`);
    
    // Force EMAIL_ENABLED for this test script if not present in .env
    process.env.EMAIL_ENABLED = 'true';

    try {
        const result = await sendBookingEmails(testBooking, testWorker);
        if (result) {
            console.log('🎯 SUCCESS: Email service seems to be configured correctly!');
        } else {
            console.log('❌ FAILURE: Email service failed to send.');
        }
    } catch (error) {
        console.error('💥 CRITICAL ERROR during test:', error);
    }
}

runTest();
