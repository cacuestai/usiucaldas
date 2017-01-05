-- Definición de vistas y funciones requeridas

CREATE OR REPLACE VIEW docentes_view AS
   SELECT usuario.id_usuario, usuario.nombre || ' ' || usuario.apellido AS nombre_usuario, 'docente'::text AS rol, contrasena 
      FROM usuario INNER JOIN docente ON usuario.id_usuario = docente.id_usuario
   ORDER BY nombre_usuario ASC;



