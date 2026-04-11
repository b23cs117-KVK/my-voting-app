const Election = require('../models/Election');
const User = require('../models/User');
const axios = require('axios');

async function processExpiredElections() {
  try {
    const now = new Date();
    // Find elections that are not completed but should be
    const expiredElections = await Election.find({
        status: { $ne: 'completed' },
        endTime: { $lte: now }
    });

    for (const election of expiredElections) {
        console.log(`[Auto-Complete] Processing election: ${election.title}`);
        
        election.status = 'completed';
        await election.save();

        // Notify users
        const users = await User.find({}, 'email name');
        for (const user of users) {
            try {
                if (process.env.GOOGLE_BRIDGE_URL) {
                    await axios.post(process.env.GOOGLE_BRIDGE_URL, {
                        password: process.env.BRIDGE_PASSWORD,
                        to: user.email,
                        subject: `Final Results: ${election.title} are now available`,
                        html: `
                            <div style="font-family: sans-serif; padding: 20px; color: #1a1a1a;">
                                <h2 style="color: #3b82f6;">The results are in!</h2>
                                <p>Hi ${user.name},</p>
                                <p>The election "<strong>${election.title}</strong>" has officially concluded.</p>
                                <p>You can now check the final results on your dashboard.</p>
                                <a href="${process.env.FRONTEND_URL}/results/${election._id}" style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block; margin-top: 10px;">View Results</a>
                            </div>
                        `
                    });
                }
            } catch (emailErr) {
                console.error(`[Auto-Complete] Failed to notify ${user.email}:`, emailErr.message);
            }
        }
        console.log(`[Auto-Complete] Concluded and notified for: ${election.title}`);
    }
  } catch (err) {
    console.error('[Auto-Complete] Error:', err.message);
  }
}

// Check every 60 seconds
function startAutoCompleteTask() {
    console.log('🚀 Automated Election Completion Task started.');
    setInterval(processExpiredElections, 60000);
}

module.exports = startAutoCompleteTask;
