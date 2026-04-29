-- Migración: agregar candidato_id a usuarios para vincular perfil candidato
ALTER TABLE usuarios
  MODIFY COLUMN rol VARCHAR(50) DEFAULT 'candidato',
  ADD COLUMN IF NOT EXISTS candidato_id INT DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS nombre_empresa VARCHAR(255) DEFAULT NULL;
