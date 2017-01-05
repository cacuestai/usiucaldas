<?php

class Grupo {

    function add($param) {
        extract($param);

        //INSERT INTO asignatura values('$cod_asignatura','$nombre_asignatura');
        $sql = "do $$
                    begin
                        
                        INSERT INTO grupo (numero_grupo,id_docente,codigo_asignatura,color) values('$numero_grupo','$id_docente' , '$codigo_asignatura','$color' );
                    end$$
                ";
        $conexion->getPDO()->exec($sql);

        echo $conexion->getEstado();
    }

    function edit($param) {
        extract($param);

        //UPDATE asignatura
        //               SET cod_asignatura = '$cod_asignatura', nombre_asignatura = '$nombre_asignatura'
        //               WHERE cod_asignatura = '$cod_asignatura';
        $sql = "do $$
                    begin
                       UPDATE grupo
                       SET numero_grupo = '$numero_grupo', id_docente = '$id_docente',color = '$color',codigo_asignatura='$codigo_asignatura'
                       WHERE id_grupo='$id';                       
                    end$$
                    ";


        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    function del($param) {
        extract($param);
        error_log(print_r($param, TRUE));
        //DELETE FROM asignatura WHERE id_usuario = '$id';
        $sql = "do $$
                    begin
                        DELETE FROM grupo WHERE id_grupo = '$id';
                        
                    end$$
                ";

        $conexion->getPDO()->exec($sql);
        echo $conexion->getEstado();
    }

    /**
     * Procesa las filas que son enviadas a un objeto jqGrid
     * @param type $param un array asociativo con los datos que se reciben de la capa de presentación
     */
    function select($param) {
        extract($param);
        $where = $conexion->getWhere($param);

        $sql = "SELECT grupo.numero_grupo, grupo.id_docente, docentes_view.nombre_usuario, grupo.id_grupo, grupo.codigo_asignatura
                   FROM grupo 
                   INNER JOIN asignatura ON asignatura.codigo_asignatura = grupo.codigo_asignatura
                   INNER JOIN docentes_view ON docentes_view.id_usuario = grupo.id_docente $where";
        
        // crear un objeto con los datos que se envían a jqGrid para mostrar la información de la tabla
        $respuesta = $conexion->getPaginacion($sql, $rows, $page, $sidx, $sord); // $rows = filas * página
        
        // agregar al objeto que se envía las filas de la página requerida
        if (($rs = $conexion->getPDO()->query($sql))) {
            $cantidad = 999; // se pueden enviar al grid valores calculados o constantes
            $tiros_x_unidad = 2;

            while ($fila = $rs->fetch(PDO::FETCH_ASSOC)) {
                //$tipoEstado = UtilConexion::$tipoEstadoProduccion[$fila['estado']];  // <-- OJO, un valor calculado

                $respuesta['rows'][] = [
                    'id' => $fila['id_grupo'], // <-- debe identificar de manera única una fila del grid, por eso se usa la PK
                    'cell' => [ // los campos que se muestra en las columnas del grid
                        $fila['numero_grupo'],
                        $fila['nombre_usuario'],
                        $fila['codigo_asignatura']
                    ]
                ];
            }
        }
        $conexion->getEstado(false); // envía al log un posible mensaje de error si las cosas salen mal
        echo json_encode($respuesta);
    }

}

?>