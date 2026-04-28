const { nanoid } = require('nanoid');

function shortUrl(user, url) {
    if (!url || typeof url !== 'string') {
        throw new Error("Invalid URL");
    }

    const code = nanoid(6);
    user.shorts[code] = { originalUrl: url, visits: 0 };

    return `http://localhost:3000/${code}`;
}

function getUrlEntry(user, code) {
    return user.shorts[code];
}

function incrementVisits(urlEntry) {
    urlEntry.visits++;
}

module.exports = {
    shortUrl,
    getUrlEntry,
    incrementVisits
};