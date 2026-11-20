export const ALLOWED_STATUSES = ["PENDIENTE", "PROGRAMADA", "COMPLETADA", "CANCELADA"];

export function validateCreateRequest(payload = {}) {
    const errors = [];

    const materialName = String(payload.materialName || "").trim();
    const pickupAddress = String(payload.pickupAddress || "").trim();
    const scheduledDate = String(payload.scheduledDate || "").trim();
    const notes = String(payload.notes || "").trim();
    const quantityKg = Number(payload.quantityKg);

    if (materialName.length < 2 || materialName.length > 120) {
        errors.push("materialName debe tener entre 2 y 120 caracteres.");
    }
    if (!Number.isFinite(quantityKg) || quantityKg <= 0) {
        errors.push("quantityKg debe ser un número mayor a 0.");
    }
    if (pickupAddress.length < 5 || pickupAddress.length > 200) {
        errors.push("pickupAddress debe tener entre 5 y 200 caracteres.");
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
        errors.push("scheduledDate debe usar el formato YYYY-MM-DD.");
    }
    if (notes.length > 500) {
        errors.push("notes no puede superar los 500 caracteres.");
    }

    if (errors.length > 0) {
        return { valid: false, errors };
    }

    return {
        valid: true,
        data: {
            materialName,
            quantityKg,
            pickupAddress,
            scheduledDate,
            notes,
        },
    };
}

export function validateStatusUpdate(payload = {}) {
    const status = String(payload.status || "").trim().toUpperCase();
    if (!ALLOWED_STATUSES.includes(status)) {
        return {
            valid: false,
            errors: [`status debe ser uno de: ${ALLOWED_STATUSES.join(", ")}.`],
        };
    }
    return { valid: true, data: { status } };
}