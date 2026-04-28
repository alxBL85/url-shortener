const express = require('express');
const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-secret-key'; // Cambia esto por una variable de entorno en producción

const usuarios = []; // Simulación de base de datos para usuarios
const tokenBlacklist = new Set(); // Tokens JWT revocados por logout

// Funciones auxiliares para usuarios
function findUserByUsername(username) {
    return usuarios.find(user => user.username === username);
}

function findUserById(id) {
    return usuarios.find(user => user.id === id);
}

function addUser(userData) {
    const existingUser = findUserByUsername(userData.username);
    if (existingUser) {
        throw new Error('Username already exists');
    }
    const hashedPassword = bcrypt.hashSync(userData.password, 10);
    const newUser = {
        id: nanoid(),
        username: userData.username,
        email: userData.email,
        password: hashedPassword,
        createdAt: new Date(),
        shorts: {}
    };
    usuarios.push(newUser);
    return newUser;
}

// Middleware para autenticación
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }

        if (tokenBlacklist.has(token)) {
            return res.status(403).json({ error: 'Token has been revoked' });
        }

        req.user = user;
        next();
    });
}

/**
 * POST
/shorten
Recibe { url }, devuelve { code, shortUrl }
GET
/:code
Redirige 302 a la URL original e incrementa visitas
GET
/stats/:code
Devuelve { code, originalUrl, visits }
 */

function shortUrl(user, url) {
    if (!url || typeof url !== 'string') {
        throw new Error("Invalid URL");
    }

    const code = nanoid(6);
    user.shorts[code] = { originalUrl: url, visits: 0 };

    return `http://localhost:3000/${code}`;
}

async function postShorten(req, res) {
    const { url } = req.body;
    const user = findUserById(req.user.userId);

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    try {
        const sUrl = shortUrl(user, url);
        res.status(201).json({ shortUrl: sUrl });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function getStats(req, res) {
    const { code } = req.params;
    const user = findUserById(req.user.userId);

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const urlEntry = user.shorts[code];
    if (!urlEntry) {
        return res.status(404).json({ error: "URL not found" });
    }

    res.json({ code, originalUrl: urlEntry.originalUrl, visits: urlEntry.visits });
}

async function getCode(req, res) {
    const { code } = req.params;
    const user = findUserById(req.user.userId);

    if (!user) {
        return res.status(401).json({ error: 'User not found' });
    }

    const urlEntry = user.shorts[code];
    if (!urlEntry) {
        return res.status(404).json({ error: "URL not found" });
    }

    urlEntry.visits++;
    res.redirect(302, urlEntry.originalUrl);
}

// Endpoints para autenticación
async function postRegister(req, res) {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Username, email, and password are required' });
    }

    if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }

    try {
        const newUser = addUser({ username, email, password });
        res.status(201).json({ message: 'User registered successfully', userId: newUser.id });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
}

async function postLogin(req, res) {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
    }

    const user = findUserByUsername(username);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
}

async function postLogout(req, res) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(400).json({ error: 'Authorization token required to logout' });
    }

    tokenBlacklist.add(token);
    res.json({ message: 'Logout successful' });
}

const app = express();
app.use(express.json());

app.post("/shorten", authenticateToken, (req, res)=> postShorten(req, res));
app.get("/:code", authenticateToken, (req, res) => getCode(req, res) );
app.get("/stats/:code", authenticateToken, (req,res) => getStats(req, res));

app.post("/register", (req, res) => postRegister(req, res));
app.post("/login", (req, res) => postLogin(req, res));
app.post("/logout", authenticateToken, (req, res) => postLogout(req, res));

app.listen(3000, ()=> { console.log("alive")})
