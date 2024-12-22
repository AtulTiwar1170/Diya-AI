const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const multer = require('multer');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const speech = require('@google-cloud/speech');
const textToSpeech = require('@google-cloud/text-to-speech');

const app = express();
const upload = multer();

const dotenv = require('dotenv');
dotenv.config()
// Middleware
app.use(cors(
    {
        origin: 'http://localhost:5173',
        methods: ['GET', 'post', 'put', 'delete', 'patch', 'put', 'options', 'head'],
        credentials: true,
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));
app.use(express.json());

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// Initialize Speech-to-Text and Text-to-Speech clients
const speechClient = new speech.SpeechClient();
const ttsClient = new textToSpeech.TextToSpeechClient();

// MongoDB Schema Definitions
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: String,
    createdAt: { type: Date, default: Date.now }
});

const messageSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Message = mongoose.model('Message', messageSchema);

// Authentication Middleware
const                                                                                                                                                                                                                                    authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Access denied' });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ error: 'Invalid token' });
        req.user = user;
        next();
    });
};

// Routes
app.post('/api/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
    }
});

app.post('/api/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: 'Error logging in' });
    }
});

app.post('/api/transcribe', authenticateToken, upload.single('audio'), async (req, res) => {
    try {
        const audioBytes = req.file.buffer.toString('base64');

        const request = {
            audio: { content: audioBytes },
            config: {
                encoding: 'LINEAR16',
                sampleRateHertz: 16000,
                languageCode: 'en-US',
            },
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
            .map(result => result.alternatives[0].transcript)
            .join('\n');

        res.json({ text: transcription });
    } catch (error) {
        res.status(500).json({ error: 'Error transcribing audio' });
    }
});

app.post('/api/chat', authenticateToken, async (req, res) => {
    try {
        const { prompt } = req.body; // Change this line
// This should now log the prompt correctly
        
        // Store user message
        await new Message({
            userId: req.user.userId,
            role: 'user',
            content: prompt // Use prompt here
        }).save();

        // Generate response using Gemini
        const result = await model.generateContent(prompt); // Use prompt here
        const response = result.response.text();

        
        // Store assistant message
        await new Message({
            userId: req.user.userId,
            role: 'assistant',
            content: response
        }).save();

        res.json({ response });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Error generating response' });
    }
});

app.post('/api/synthesize', authenticateToken, async (req, res) => {
    try {
        const { text } = req.body;

        const request = {
            input: { text },
            voice: { languageCode: 'en-US', ssmlGender: 'NEUTRAL' },
            audioConfig: { audioEncoding: 'MP3' },
        };

        const [response] = await ttsClient.synthesizeSpeech(request);
        res.set('Content-Type', 'audio/mp3');
        res.send(response.audioContent);
    } catch (error) {
        res.status(500).json({ error: 'Error synthesizing speech' });
    }
});

app.get('/api/messages', authenticateToken, async (req, res) => {
    try {
        const messages = await Message.find({ userId: req.user.userId })
            .sort({ timestamp: 1 });
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching messages' });
    }
});

// Connect to MongoDB and start server
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        app.listen(process.env.PORT || 3000, () => {
            console.log('Server running on port', process.env.PORT || 3000);
        });
    })
    .catch(err => console.error('Error connecting to MongoDB:', err));