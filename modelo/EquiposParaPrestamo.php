<?php

class EquiposParaPrestamo {

    function add($param) {
        extract($param);

        $sql = "INSERT INTO equipos_para_prestamos (nombre,descripcion,estado) values('$nombre','$descripcion','$estado')";

        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    function edit($param) {
        extract($param);

        $sql = "UPDATE equipos_para_prestamos
                       SET  nombre = '$nombre',descripcion='$descripcion',
					   estado='$estado'
                       WHERE id_equipo_para_prestamo = '$id';";

        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    function del($param) {
        extract($param);
        error_log(print_r($param, TRUE));
        $conexion->getPDO()->exec("DELETE FROM equipos_para_prestamos WHERE id_equipo_para_prestamo = '$id';");
        echo $conexion->getEstado();
    }

    /**
     * Procesa las filas que son enviadas a un objeto jqGrid
     * @param type $param un array asociativo con los datos que se reciben de la capa de presentación
     */
    function select($param) {
        extract($param);
        $where = $conexion->getWhere($param);
        // conserve siempre esta sintaxis para enviar filas al grid:
        $sql = "SELECT id_equipo_para_prestamo,nombre,descripcion,estado from equipos_para_prestamos";
        // crear un objeto con los datos que se envían a jqGrid para mostrar la información de la tabla
        $respuesta = $conexion->getPaginacion($sql, $rows, $page, $sidx, $sord); // $rows = filas * página
        // agregar al objeto que se envía las filas de la página requerida
        if (($rs = $conexion->getPDO()->query($sql))) {
            $cantidad = 999; // se pueden enviar al grid valores calculados o constantes
            $tiros_x_unidad = 2;

            while ($fila = $rs->fetch(PDO::FETCH_ASSOC)) {
                //$tipoEstado = UtilConexion::$tipoEstadoProduccion[$fila['estado']];  // <-- OJO, un valor calculado
                $estadoEq = UtilConexion::$estadoEquipos[$fila['estado']];

                $respuesta['rows'][] = [
                    'id' => $fila['id_equipo_para_prestamo'], // <-- debe identificar de manera única una fila del grid, por eso se usa la PK
                    'cell' => [ // los campos que se muestra en las columnas del grid
                        //    $fila['id_equipo_para_prestamo'],
                        $fila['nombre'],
                        $fila['descripcion'],
                        $estadoEq
                    ]
                ];
            }
        }
        $conexion->getEstado(false); // envía al log un posible mensaje de error si las cosas salen mal
        echo json_encode($respuesta);
    }

    public function getSelect($param) {
        $json = FALSE;
        extract($param);
        $select = "";
        $select .= "<option value='0'>Seleccione un equipo</option>";
        foreach ($conexion->getPDO()->query("SELECT id_equipo_para_prestamo, nombre FROM equipos_para_prestamos ORDER BY nombre") as $fila) {
            $select .= "<option value='{$fila['id_equipo_para_prestamo']}'>{$fila['nombre']}</option>";
        }
        echo $json ? json_encode($select) : ("<select id='$id'>$select</select>");
    }

}

?>