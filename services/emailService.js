const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // use SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

/**
 * Premium HTML Email Templates for FixIt Anywhere
 */
const getHtmlWrapper = (content) => `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f7faf9; color: #1a2e23; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #f7faf9; padding-bottom: 40px; }
        .main-content { max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); border: 1px solid #e2eee8; }
        .header { background-color: #ffffff; padding: 40px 40px 20px; text-align: center; }
        .logo { font-size: 24px; font-weight: 800; color: #1a2e23; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; }
        .logo span { color: #22c55e; }
        .body { padding: 0 40px 40px; }
        .hero { text-align: center; margin-bottom: 30px; }
        .hero h1 { font-size: 28px; margin-bottom: 12px; color: #1a2e23; }
        .hero p { font-size: 16px; color: #5c7c6a; line-height: 1.6; }
        .card { background-color: #f7faf9; border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 1px solid #e2eee8; }
        .card-row { display: flex; margin-bottom: 12px; }
        .card-label { font-size: 13px; font-weight: 600; text-transform: uppercase; color: #5c7c6a; margin-bottom: 4px; }
        .card-value { font-size: 16px; color: #1a2e23; font-weight: 500; }
        .btn { display: inline-block; background-color: #22c55e; color: #ffffff !important; padding: 14px 28px; border-radius: 9999px; text-decoration: none; font-weight: 600; font-size: 16px; margin-top: 20px; box-shadow: 0 4px 14px 0 rgba(34, 197, 94, 0.39); }
        .footer { text-align: center; font-size: 12px; color: #8fa79a; padding: 20px; }
        .divider { height: 1px; background-color: #e2eee8; margin: 30px 0; }
        .badge { display: inline-block; padding: 4px 12px; border-radius: 9999px; background-color: #e2f9eb; color: #22c55e; font-size: 12px; font-weight: 600; margin-bottom: 15px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="main-content">
            <div class="header">
                <div class="logo"><span>🏠</span> FixIt Anywhere</div>
            </div>
            <div class="body">
                ${content}
            </div>
        </div>
        <div class="footer">
            &copy; 2026 FixIt Anywhere Professional Home Services.<br>
            Delivering excellence to your doorstep.
        </div>
    </div>
</body>
</html>
`;

const sendBookingEmails = async (booking, worker) => {
    if (process.env.EMAIL_ENABLED !== 'true') {
        console.log('📬 Email service is currently disabled. Skipping email dispatch.');
        return true;
    }

    // --- Customer Template Content ---
    const customerHtml = `
        <div class="hero">
            <div class="badge">Booking Confirmed</div>
            <h1>Your expert help is on the way!</h1>
            <p>Hi ${booking.name}, we've received your request for <strong>${booking.serviceType}</strong>. Our top-rated professional is ready to assist you.</p>
        </div>
        
        <div class="card">
            <div style="margin-bottom: 15px;">
                <div class="card-label">SERVICE TYPE</div>
                <div class="card-value">${booking.serviceType.toUpperCase()}</div>
            </div>
            <div style="display: table; width: 100%;">
                <div style="display: table-cell; width: 50%;">
                    <div class="card-label">DATE</div>
                    <div class="card-value">${booking.date}</div>
                </div>
                <div style="display: table-cell; width: 50%;">
                    <div class="card-label">TIME SLOT</div>
                    <div class="card-value">${booking.time}</div>
                </div>
            </div>
            <div style="margin-top: 15px;">
                <div class="card-label">LOCATION</div>
                <div class="card-value">${booking.address}</div>
            </div>
        </div>

        ${worker ? `
        <div style="text-align: center; margin-top: 30px;">
            <p style="font-size: 14px; color: #5c7c6a; margin-bottom: 10px;">YOUR ASSIGNED PROFESSIONAL</p>
            <div style="font-weight: 700; font-size: 18px; color: #1a2e23;">${worker.name}</div>
            <p style="font-size: 14px; color: #22c55e;">Verified Specialist</p>
        </div>
        ` : `
        <div class="card" style="background-color: #fff9e6; border-color: #ffecb3;">
            <p style="margin: 0; color: #856404; font-size: 14px;">🛠️ We are currently matching you with the best available professional in your area. You'll receive a follow-up once assigned.</p>
        </div>
        `}

        <div class="divider"></div>
        <div style="text-align: center;">
            <p style="font-size: 14px; color: #5c7c6a;">Need to make changes? Call our support team.</p>
            <a href="#" class="btn">Manage Booking</a>
        </div>
    `;

    // --- Worker Template Content ---
    const workerHtml = worker ? `
        <div class="hero">
            <div class="badge">New Job Assignment</div>
            <h1>New ${booking.serviceType} Opportunity</h1>
            <p>Hi ${worker.name}, you have been matched with a new job. Please review the details below and prepare for the appointment.</p>
        </div>
        
        <div class="card">
            <div style="margin-bottom: 15px;">
                <div class="card-label">CUSTOMER NAME</div>
                <div class="card-value">${booking.name}</div>
            </div>
            <div style="margin-bottom: 15px;">
                <div class="card-label">CONTACT PHONE</div>
                <div class="card-value">${booking.phone}</div>
            </div>
            <div style="margin-bottom: 15px;">
                <div class="card-label">SERVICE ADDRESS</div>
                <div class="card-value">${booking.address}</div>
            </div>
            <div style="display: table; width: 100%;">
                <div style="display: table-cell; width: 50%;">
                    <div class="card-label">DATE</div>
                    <div class="card-value">${booking.date}</div>
                </div>
                <div style="display: table-cell; width: 50%;">
                    <div class="card-label">START TIME</div>
                    <div class="card-value">${booking.time}</div>
                </div>
            </div>
        </div>

        <div style="text-align: center; margin-top: 30px;">
            <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(booking.address)}" class="btn" target="_blank">Open Navigation Maps</a>
        </div>
    ` : '';

    const customerMailOptions = {
        from: `"FixIt Anywhere" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `Booking Confirmed: ${booking.serviceType} - FixIt Anywhere`,
        html: getHtmlWrapper(customerHtml)
    };

    try {
        await transporter.sendMail(customerMailOptions);
        if (worker && workerHtml) {
            const workerMailOptions = {
                from: `"FixIt Anywhere" <${process.env.EMAIL_USER}>`,
                to: worker.email,
                subject: `New Job: ${booking.serviceType} at ${booking.time}`,
                html: getHtmlWrapper(workerHtml)
            };
            await transporter.sendMail(workerMailOptions);
            console.log('✅ Premium HTML Emails sent successfully to customer and worker.');
        } else {
            console.log('✅ Premium HTML Email sent successfully to customer.');
        }
        return true;
    } catch (error) {
        console.error('❌ Error sending premium emails:', error);
        return false;
    }
};

const sendFeedbackRequest = async (booking, worker) => {
    if (process.env.EMAIL_ENABLED !== 'true') return true;

    const feedbackHtml = `
        <div class="hero">
            <div class="badge">Job Completed</div>
            <h1>How was your service?</h1>
            <p>Hi ${booking.name}, our professional <strong>${worker.name}</strong> has just finished the <strong>${booking.serviceType}</strong> job at your location.</p>
            <p>We'd love to hear your feedback to ensure we keep delivering the best service possible.</p>
        </div>
        
        <div class="card" style="text-align: center;">
            <p style="margin-bottom: 20px; font-weight: 600;">Rate your experience with ${worker.name}:</p>
            <a href="http://localhost:5001/feedback.html?bookingId=${booking.id}" class="btn">Leave a Review</a>
        </div>

        <div class="divider"></div>
        <div style="text-align: center; color: #5c7c6a; font-size: 13px;">
            <p>Your feedback directly impacts our professional's ratings and helps other customers find the best help.</p>
        </div>
    `;

    const mailOptions = {
        from: `"FixIt Anywhere" <${process.env.EMAIL_USER}>`,
        to: booking.email,
        subject: `Service Complete: Rate your ${booking.serviceType} experience`,
        html: getHtmlWrapper(feedbackHtml)
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`✅ Feedback request email sent to ${booking.email}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending feedback request:', error);
        return false;
    }
};

module.exports = { sendBookingEmails, sendFeedbackRequest };
