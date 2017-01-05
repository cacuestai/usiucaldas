<?php

/**
 * Description of OrdenProduccion
 * Implementa el CRUD para las órdenes de producción
 * @author Administrador
 */
class Asignatura {

    function add($param) {
        extract($param);

        $sql = "INSERT INTO asignatura values('$codigo_asignatura','$nombre_asignatura')";

        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    function edit($param) {
        extract($param);

        $sql = "UPDATE asignatura
                       SET codigo_asignatura = '$codigo_asignatura', nombre_asignatura = '$nombre_asignatura'
                       WHERE codigo_asignatura = '$id';";
        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    function del($param) {
        extract($param);
        error_log(print_r($param, TRUE));
        $conexion->getPDO()->exec("DELETE FROM asignatura WHERE codigo_asignatura = '$id';");
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
        $sql = "SELECT codigo_asignatura,nombre_asignatura FROM asignatura $where";
        // crear un objeto con los datos que se envían a jqGrid para mostrar la información de la tabla
        $respuesta = $conexion->getPaginacion($sql, $rows, $page, $sidx, $sord); // $rows = filas * página
        // agregar al objeto que se envía las filas de la página requerida
        if (($rs = $conexion->getPDO()->query($sql))) {
            $cantidad = 999; // se pueden enviar al grid valores calculados o constantes
            $tiros_x_unidad = 2;

            while ($fila = $rs->fetch(PDO::FETCH_ASSOC)) {
                //$tipoEstado = UtilConexion::$tipoEstadoProduccion[$fila['estado']];  // <-- OJO, un valor calculado

                $respuesta['rows'][] = [
                    'id' => $fila['codigo_asignatura'], // <-- debe identificar de manera única una fila del grid, por eso se usa la PK
                    'cell' => [ // los campos que se muestra en las columnas del grid
                        $fila['codigo_asignatura'],
                        $fila['nombre_asignatura']
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
        $select = "<option value='0'>Seleccione una asignatura</option>";
        foreach ($conexion->getPDO()->query("SELECT * FROM asignatura ORDER BY nombre_asignatura ASC") as $fila) {
            $asignatura = $fila['codigo_asignatura'] . ' - ' . $fila['nombre_asignatura'];
            $select .= "<option value='{$fila['codigo_asignatura']}'>$asignatura</option>";
        }
        echo $json ? json_encode($select) : ("<select id='$id'>$select</select>");
    }

}

?>