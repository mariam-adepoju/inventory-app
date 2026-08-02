const fs = require("fs/promises");
const path = require("path");

let writeQueue = Promise.resolve();
//  Ensure the data file exists.
async function ensureFile(filePath) {
    try {
        await fs.access(filePath);
    } catch {
        try {
            await fs.mkdir(path.dirname(filePath), {
                recursive: true
            });
            await fs.writeFile(filePath, "[]", "utf8");
        } catch {
            const err = new Error(
                "Failed to initialize database."
            );
            err.status = 500;
            throw err;
        }
    }
}
//  Read JSON data from disk.
async function readData(filePath) {
    await ensureFile(filePath);
    let raw;
    try {
        raw = await fs.readFile(filePath, "utf8");
    } catch {
        const err = new Error(
            "Failed to read database."
        );
        err.status = 500;
        throw err;
    }
    let data;
    try {
        data = JSON.parse(raw || "[]");
    } catch {
        const err = new Error(
            "Database contains invalid JSON."
        );
        err.status = 500;
        throw err;
    }

    if (!Array.isArray(data)) {
        const err = new Error(
            "Database must contain an array."
        );
        err.status = 500;
        throw err;
    }
    return data;
}
//  Queue writes to prevent corruption.
function writeData(filePath, data) {
    writeQueue = writeQueue.then(async () => {
        await ensureFile(filePath);
        try {
            await fs.writeFile(
                filePath,
                JSON.stringify(data, null, 2),
                "utf8"
            );
        } catch {
            const err = new Error(
                "Failed to write database."
            );
            err.status = 500;
            throw err;
        }
    });
    return writeQueue;
}

module.exports = { readData, writeData };