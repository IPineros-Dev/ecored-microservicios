import assert from "node:assert/strict";
import test from "node:test";
import { validateCreateRequest, validateStatusUpdate } from "../src/validation.js";

test("acepta una solicitud de recolección válida", () => {
    const result = validateCreateRequest({
        materialName: "Cartón corrugado",
        quantityKg: 45.5,
        pickupAddress: "Calle 26 # 68-15, Bogotá",
        scheduledDate: "2026-11-25",
        notes: "Portería de carga",
    });

    assert.equal(result.valid, true);
    assert.equal(result.data.quantityKg, 45.5);
});

test("rechaza una cantidad negativa y fecha inválida", () => {
    const result = validateCreateRequest({
        materialName: "PET",
        quantityKg: -10,
        pickupAddress: "Av. El Dorado # 50",
        scheduledDate: "25/11/2026",
    });

    assert.equal(result.valid, false);
    assert.equal(result.errors.length, 2);
});

test("valida cambios de estado permitidos", () => {
    assert.equal(validateStatusUpdate({ status: "programada" }).valid, true);
    assert.equal(validateStatusUpdate({ status: "INEXISTENTE" }).valid, false);
});