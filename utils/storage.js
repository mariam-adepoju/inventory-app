const fs = require('fs');

function readData(filePath) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, 'utf8', (err, data) => {
            if (err) return reject(new Error('Failed to read database'));
            try {
                resolve(JSON.parse(data));
            } catch (parseErr) {
                reject(new Error('Invalid database format'));
            }
        });
    });
}

function writeData(filePath, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(data, null, 2), err => {
            if (err) return reject(new Error('Failed to write to database'));
            resolve(true);
        });
    });
}

module.exports = { readData, writeData };