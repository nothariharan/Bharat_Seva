// Basic Auth Controller for Hackathon Demo
// Uses 123456 as a universal OTP for all phone numbers for demo purposes

const login = async (req, res) => {
    try {
        const { phoneNumber, otp, role } = req.body;

        if (otp === '123456') {
            res.json({
                success: true,
                token: `mock-token-${Date.now()}`,
                user: {
                    phoneNumber,
                    role: role || 'citizen'
                }
            });
        } else {
            res.status(401).json({ error: 'Invalid OTP. For demo use 123456.' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Login failed' });
    }
};

const sendOtp = async (req, res) => {
    // In a real app, this would send an SMS via Twilio
    res.json({ success: true, message: 'OTP sent to your phone number (Use 123456 for demo)' });
};

module.exports = { login, sendOtp };
