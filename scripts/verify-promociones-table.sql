-- Verificar la estructura de la tabla promociones
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'promociones' 
ORDER BY ordinal_position;

-- Verificar si hay datos en la tabla
SELECT COUNT(*) as total_promociones FROM promociones;

-- Mostrar algunas promociones si existen
SELECT id, shopify_id, titulo, tipo, valor, activa, fecha_creacion 
FROM promociones 
LIMIT 5;
