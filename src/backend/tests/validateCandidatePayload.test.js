import assert from "node:assert/strict";
import test from "node:test";
import { validateCandidatePayload } from "../middlewares/validateCandidate.js";

function runMiddleware(body) {
  const req = { body };
  const res = {};
  let nextError = null;

  validateCandidatePayload(req, res, (error) => {
    nextError = error || null;
  });

  return { req, nextError };
}

test("validateCandidatePayload normalizes valid payload", () => {
  const { req, nextError } = runMiddleware({
    nombre: "  Ana  ",
    ciudad: " Bogota ",
    cargo: " Operaria ",
    experiencia: "3",
    certificaciones: "A, B",
    disponibilidad: "Inmediata",
    jornada: "Diurna",
    aspiracion: "1500000",
    observaciones: "  Perfil solido  ",
  });

  assert.equal(nextError, null);
  assert.equal(req.body.nombre, "Ana");
  assert.equal(req.body.ciudad, "Bogota");
  assert.equal(req.body.cargo, "Operaria");
  assert.equal(req.body.experiencia, 3);
  assert.equal(req.body.aspiracion, 1500000);
  assert.equal(req.body.estado, "Aplicó");
});

test("validateCandidatePayload rejects missing required fields", () => {
  const { nextError } = runMiddleware({
    nombre: "",
    ciudad: "Bogota",
    cargo: "",
  });

  assert.ok(nextError);
  assert.equal(nextError.status, 400);
  assert.match(nextError.message, /obligatorios/i);
});

test("validateCandidatePayload rejects negative numbers", () => {
  const { nextError } = runMiddleware({
    nombre: "Ana",
    ciudad: "Bogota",
    cargo: "Operaria",
    experiencia: -1,
  });

  assert.ok(nextError);
  assert.equal(nextError.status, 400);
  assert.match(nextError.message, /experiencia/i);
});
