const path = require('path');
const { readData, writeData } = require('../utils/storage');
const { validateItemPayload, normalizeSize } = require('../utils/validator');

const DATA_FILE = path.join(__dirname, '..', 'db', 'items.json');

const inventoryController = {
    async getAllItems(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            return res.status(200).json({ success: true, count: items.length, data: items });
        } catch (err) {
            next(err);
        }
    },

    async getItemById(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            const item = items.find(i => i.id === req.params.id);
            if (!item) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }
            return res.status(200).json({ success: true, data: item });
        } catch (err) {
            next(err);
        }
    },

    async createItem(req, res, next) {
        try {
            const validationErrors = validateItemPayload(req.body, false);
            if (validationErrors.length > 0) {
                const error = new Error(validationErrors.join(', '));
                error.status = 400;
                return next(error);
            }

            const items = await readData(DATA_FILE);
            const newItem = {
                id: Date.now().toString(),
                name: req.body.name.trim(),
                price: Number(req.body.price),
                size: normalizeSize(req.body.size)
            };

            items.push(newItem);
            await writeData(DATA_FILE, items);

            return res.status(201).json({ success: true, data: newItem });
        } catch (err) {
            next(err);
        }
    },

    async updateItem(req, res, next) {
        try {
            const validationErrors = validateItemPayload(req.body, true);
            if (validationErrors.length > 0) {
                const error = new Error(validationErrors.join(', '));
                error.status = 400;
                return next(error);
            }

            const items = await readData(DATA_FILE);

            // Find index supporting both string and numeric IDs safely
            const index = items.findIndex(i => String(i.id) === String(req.params.id));
            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            const current = items[index];

            // Construct the updated item: merges provided fields or falls back to existing current fields
            const updatedItem = {
                id: current.id,
                name: req.body.name !== undefined ? req.body.name.trim() : current.name,
                price: req.body.price !== undefined ? Number(req.body.price) : current.price,
                size: req.body.size !== undefined ? normalizeSize(req.body.size) : current.size
            };

            items[index] = updatedItem;
            await writeData(DATA_FILE, items);

            return res.status(200).json({ success: true, data: updatedItem });
        } catch (err) {
            next(err);
        }
    },

    async deleteItem(req, res, next) {
        try {
            const items = await readData(DATA_FILE);
            const index = items.findIndex(i => String(i.id) === String(req.params.id));

            if (index === -1) {
                const error = new Error('Item not found');
                error.status = 404;
                return next(error);
            }

            const deletedItem = items.splice(index, 1)[0];
            await writeData(DATA_FILE, items);

            return res.status(200).json({ success: true, message: 'Item deleted successfully', data: deletedItem });
        } catch (err) {
            next(err);
        }
    }
};

module.exports = inventoryController;