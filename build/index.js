"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const axios_1 = __importDefault(require("axios"));
const app = (0, express_1.default)();
const port = 3000;
const SECRET_KEY = 'sachin';
// Middleware to parse JSON body
app.use(express_1.default.json());
// Dummy user credentials
const users = [
    { username: 'user1', password: 'password1' },
    { username: 'user2', password: 'password2' },
    { username: 'user3', password: 'password3' }
];
// Login route
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    // Check if the user credentials are valid
    const user = users.find(user => user.username === username && user.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }
    // Generate a JWT token
    const token = jsonwebtoken_1.default.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });
    res.json({ token });
});
// Search route
app.get('/api/search', authenticateToken, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title } = req.query;
    if (!title) {
        return res.status(400).json({ message: 'Title is required' });
    }
    try {
        const encodedTitle = encodeURIComponent(title); // Explicitly cast to string
        // Fetch results from TV Maze API
        const response = yield axios_1.default.get(`https://api.tvmaze.com/search/shows?q=${encodedTitle}`);
        const shows = response.data;
        res.json({ shows });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
    }
}));
// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        req.user = user; // Type assertion to AuthenticatedRequest
        next();
    });
}
// Start the server
app.listen(port, () => {
    console.log(`Server started on port ${port}`);
});
