-- Tabla de Usuarios (autenticación)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255),           -- NULL si usa OAuth
  provider VARCHAR(50) DEFAULT 'local', -- 'local' | 'google' | 'microsoft'
  provider_id VARCHAR(255),             -- ID del proveedor OAuth
  avatar_url VARCHAR(500),
  rol VARCHAR(50) DEFAULT 'reclutador', -- 'admin' | 'reclutador'
  activo TINYINT(1) DEFAULT 1,
  fecha_creacion VARCHAR(50),
  fecha_actualizacion VARCHAR(50),
  UNIQUE KEY unique_provider (provider, provider_id),
  INDEX idx_email (email)
);

-- Tabla de tokens de restablecimiento de contraseña
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INT PRIMARY KEY AUTO_INCREMENT,
  usuario_id INT NOT NULL,
  token VARCHAR(255) NOT NULL UNIQUE,
  expira_en VARCHAR(50) NOT NULL,
  usado TINYINT(1) DEFAULT 0,
  fecha_creacion VARCHAR(50),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE,
  INDEX idx_token (token)
);
