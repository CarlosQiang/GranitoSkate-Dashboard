-- Verificar si la tabla existe y crearla si no existe
CREATE TABLE IF NOT EXISTS promociones (
  id SERIAL PRIMARY KEY,
  shopify_id VARCHAR(255),
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) DEFAULT 'PERCENTAGE_DISCOUNT',
  valor DECIMAL(10, 2) NOT NULL,
  codigo VARCHAR(100),
  fecha_inicio TIMESTAMP,
  fecha_fin TIMESTAMP,
  activa BOOLEAN DEFAULT true,
  estado VARCHAR(50) DEFAULT 'ACTIVE',
  compra_minima DECIMAL(10, 2),
  limite_uso INTEGER,
  contador_uso INTEGER DEFAULT 0,
  es_automatica BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Mostrar la estructura de la tabla
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'promociones'
ORDER BY ordinal_position;

-- Contar registros existentes
SELECT COUNT(*) FROM promociones;
