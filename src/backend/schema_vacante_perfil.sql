-- Agregar campos del perfil profesional generado por IA a la tabla vacantes
ALTER TABLE vacantes
  ADD COLUMN resumen TEXT AFTER descripcion,
  ADD COLUMN responsabilidades JSON AFTER resumen,
  ADD COLUMN requisitos JSON AFTER responsabilidades,
  ADD COLUMN ofrecemos JSON AFTER requisitos;
