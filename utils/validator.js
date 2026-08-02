const SIZE_MAP = {
    s: "small",
    small: "small",
    m: "medium",
    medium: "medium",
    l: "large",
    large: "large"
};

function normalizeSize(size) {
    if (typeof size !== "string") {
        return size;
    }
    return SIZE_MAP[size.trim().toLowerCase()];
}

function validateItemPayload(body, options = {}) {
    const { partial = false } = options;
    const errors = [];
    const value = {};

    const validators = {
        name(input) {
            if (typeof input !== "string") {
                return { error: "Field 'name' must be a string." };
            }
            const name = input.trim();
            if (!name) {
                return { error: "Field 'name' cannot be empty." };
            }
            return { value: name };
        },

        price(input) {
            const price = Number(input);
            if (Number.isNaN(price)) {
                return { error: "Field 'price' must be a number." };
            }
            if (price <= 0) {
                return { error: "Field 'price' must be greater than zero." };
            }
            return { value: price };
        },

        size(input) {
            const size = normalizeSize(input);
            if (!size) {
                return { error: "Field 'size' must be small(s), medium(m), or large(l)." };
            }
            return { value: size };
        }
    };

    for (const field in validators) {
        const input = body[field];
        if (partial && input === undefined) {
            continue;
        }

        if (!partial && input === undefined) {
            errors.push(`Field '${field}' is required.`);
            continue;
        }

        const result = validators[field](input);
        if (result.error) {
            errors.push(result.error);
            continue;
        }

        value[field] = result.value;
    }

    return {
        valid: errors.length === 0,
        errors,
        value
    };
}

module.exports = { validateItemPayload, normalizeSize };