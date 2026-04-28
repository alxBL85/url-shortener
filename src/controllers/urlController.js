const { findUserById } = require('../models/userModel');
const { shortUrl, getUrlEntry, incrementVisits } = require('../models/urlModel');

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

    const urlEntry = getUrlEntry(user, code);
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

    const urlEntry = getUrlEntry(user, code);
    if (!urlEntry) {
        return res.status(404).json({ error: "URL not found" });
    }

    incrementVisits(urlEntry);
    res.redirect(302, urlEntry.originalUrl);
}

module.exports = {
    postShorten,
    getStats,
    getCode
};