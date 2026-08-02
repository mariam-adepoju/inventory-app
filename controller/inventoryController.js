const path = require('path');
const crypto = require("crypto");
const { readData, writeData } = require('../utils/storage');
const { validateItemPayload } = require('../utils/validator');

const DATA_FILE = path.join(__dirname, '..', 'db', 'items.json');

function findItemIndex(items, id) {
    return items.findIndex(item => String(item.id) === String(id));
}

function generateId(length = 8) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString("hex")
        .slice(0, length);
}

const inventoryController = {
    async getAllItems(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            return res.json({ success: true, count: items.length, data: items });
        } catch (err) {
            next(err);
        }
    },

    async getItemById(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            const index = findItemIndex(items, req.params.id);
            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }
            return res.json({ success: true, message: "Item retrieved successfully", data: items[index] });
        } catch (err) {
            next(err);
        }
    },

    async createItem(req, res, next) {
        try {
            const validation = validateItemPayload(req.body, { partial: false });
            if (!validation.valid) {
                const error = new Error(validation.errors.join(', '));
                error.status = 400;
                return next(error);
            }

            const items = await readData(DATA_FILE);
            const newItem = { id: generateId(), ...validation.value };
            items.push(newItem);
            await writeData(DATA_FILE, items);
            return res.status(201).json({ success: true, message: "Item created successfully", data: newItem });
        } catch (err) {
            next(err);
        }
    },

    // PUT: Strictly requires all fields and completely replaces the resource (except ID)
    async replaceItem(req, res, next) {
        try {
            const validation = validateItemPayload(req.body, { partial: false });
            if (!validation.valid) {
                const error = new Error(validation.errors.join(', '));
                error.status = 400;
                return next(error);
            }

            const items = await readData(DATA_FILE);
            const index = findItemIndex(items, req.params.id);
            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            // Replace completely, retaining original ID
            items[index] = { id: items[index].id, ...validation.value };
            await writeData(DATA_FILE, items);
            return res.json({ success: true, message: "Item replaced successfully", data: items[index] });
        } catch (err) {
            next(err);
        }
    },

    // PATCH: Allows updating only specified/partial fields
    async updateItem(req, res, next) {
        try {
            const validation = validateItemPayload(req.body, { partial: true });
            if (!validation.valid) {
                const error = new Error(validation.errors.join(', '));
                error.status = 400;
                return next(error);
            }

            const items = await readData(DATA_FILE);
            const index = findItemIndex(items, req.params.id);
            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            // Merge updated fields into existing item
            items[index] = { ...items[index], ...validation.value };
            await writeData(DATA_FILE, items);
            return res.json({ success: true, message: "Item updated successfully", data: items[index] });
        } catch (err) {
            next(err);
        }
    },

    async deleteItem(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            const index = findItemIndex(items, req.params.id);

            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            const [deletedItem] = items.splice(index, 1);
            await writeData(DATA_FILE, items);
            return res.json({ success: true, message: 'Item deleted successfully', data: deletedItem });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = inventoryController;