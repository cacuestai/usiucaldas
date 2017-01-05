<?php

/**
 * Created by PhpStorm.
 * User: trisb
 * Date: 13/11/2016
 * Time: 11:15
 */
class Usuario {

    public function autenticar($param) {
        extract($param);
        // seleccionar un usuario con cualquier rol, para el que coincida el ID y la contraseña recibidas
        $sql = "SELECT * FROM (
                  SELECT usuario.id_usuario, usuario.nombre || ' ' || usuario.apellido AS nombre_usuario, 'administrativo' AS rol, contrasena 
                    FROM usuario INNER JOIN administrativo ON usuario.id_usuario = administrativo.id_usuario
                  UNION
                  SELECT * FROM docentes_view
                  UNION
                  SELECT usuario.id_usuario, usuario.nombre || ' ' || usuario.apellido AS nombre_usuario, 'monitor' AS rol, contrasena 
                    FROM usuario INNER JOIN monitor ON usuario.id_usuario = monitor.id_usuario
                ) AS usuarios WHERE usuarios.id_usuario = '$idUsuario' AND usuarios.contrasena = '$contrasena'";
        $ok = FALSE;

        if ($fila = $conexion->getFila($sql)) {
            // si se encuentra el usuario, iniciar sesión
            if ($idUsuario === $fila['id_usuario'] && $contrasena === $fila['contrasena']) {
                $ok = TRUE;
                session_start();
                $_SESSION['usuario_id'] = $usuario;
                $_SESSION['usuario_nombre'] = $fila['nombre_usuario'];
                $_SESSION['rol'] = $fila['rol'];
            }
        }

        if ($ok) {
            // devolver los datos del usuario, menos la contraseña
            echo json_encode(['ok' => TRUE, 'id' => $fila['id_usuario'], 'nombre' => $fila['nombre_usuario'], 'rol' => $fila['rol']]);
        } else {
            echo json_encode(['ok' => FALSE, 'mensaje' => 'Usuario o contraseña erróneos']);
        }
    }

    public function getSelect($param) {
        $json = FALSE;
        extract($param);
        $select = "";
        $select .= "<option value='0'>Seleccione un usuario</option>";
        foreach ($conexion->getPDO()->query("SELECT id_usuario, nombre, apellido FROM usuario ORDER BY apellido") as $fila) {
            $name = $fila['nombre'] . ' ' . $fila['apellido'];
            $select .= "<option value='{$fila['id_usuario']}'>{$name}</option>";
        }
        echo $json ? json_encode($select) : ("<select id='$id'>$select</select>");
    }

    public function cerrarSesion() {
        $_SESSION = [];
        if (ini_get("session.use_cookies")) {
            $params = session_get_cookie_params();
            setcookie(session_name(), '', time() - 42000, $params['path'], $params['domain'], $params['secure'], $params["httponly"]);
        }
        session_destroy();
    }

}
