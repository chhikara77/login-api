import express, { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cors from 'cors';

interface AuthenticatedRequest extends Request {
  user: any; // Define the 'user' property with any type or use a specific type for user data
}

const app = express();
const port = 3000;

const SECRET_KEY = 'sachin';

// Middleware to parse JSON body
app.use(express.json());
app.use(cors());
// Dummy user credentials
const users = [
  { username: 'user1@gmail.com', password: 'password1' },
  { username: 'user2@gmail.com', password: 'password2' },
  { username: 'user3@gmail.com', password: 'password3' }
];

// Login route
app.post('/api/login', (req: Request, res: Response) => {
  const { username, password } = req.body as { username: string, password: string };

  // Check if the user credentials are valid
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate a JWT token
  const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

  res.json({ token });
});

// Search route
app.get('/api/search', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
  const { title } = req.query;

  if (!title) {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const encodedTitle = encodeURIComponent(title as string); // Explicitly cast to string

    // Fetch results from TV Maze API
    const response = await axios.get(`https://api.tvmaze.com/search/shows?q=${encodedTitle}`);
    const shows = response.data;

    res.json({ shows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req: Request, res: Response, next: () => void) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    (req as AuthenticatedRequest).user = user; // Type assertion to AuthenticatedRequest
    next();
  });
}

// Start the server
app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
