function validateItemPayload(body, isUpdate = false) {
    const errors = [];
    const validSizes = ['small', 'medium', 'large', 's', 'm', 'l'];

    // Name validation
    if (!isUpdate) {
        if (!body.name || typeof body.name !== 'string' || body.name.trim() === '') {
            errors.push("Field 'name' is required and must be a valid non-empty string.");
        }
    } else if (body.name !== undefined) {
        if (typeof body.name !== 'string' || body.name.trim() === '') {
            errors.push("Field 'name' must be a valid non-empty string.");
        }
    }

    // Price validation
    if (!isUpdate) {
        if (body.price === undefined || typeof body.price !== 'number' || body.price < 0) {
            errors.push("Field 'price' is required and must be a positive number.");
        }
    } else if (body.price !== undefined) {
        if (typeof body.price !== 'number' || body.price < 0) {
            errors.push("Field 'price' must be a positive number.");
        }
    }

    // Size validation
    if (!isUpdate) {
        if (!body.size || typeof body.size !== 'string' || !validSizes.includes(body.size.toLowerCase())) {
            errors.push("Field 'size' is required and must be 'small(s)', 'medium(m)', or 'large(l)'.");
        }
    } else if (body.size !== undefined) {
        if (typeof body.size !== 'string' || !validSizes.includes(body.size.toLowerCase())) {
            errors.push("Field 'size' must be 'small(s)', 'medium(m)', or 'large(l)'.");
        }
    }

    return errors;
}

function normalizeSize(size) {
    if (!size) return size;
    const lower = size.toLowerCase();
    if (lower === 's') return 'small';
    if (lower === 'm') return 'medium';
    if (lower === 'l') return 'large';
    return lower;
}

module.exports = { validateItemPayload, normalizeSize };