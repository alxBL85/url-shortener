const { nanoid } = require('nanoid');
const bcrypt = require('bcryptjs');

const usuarios = []; // Simulación de base de datos para usuarios

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

module.exports = {
    findUserByUsername,
    findUserById,
    addUser
};