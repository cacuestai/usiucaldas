$(function () {

    $(window).resize(); // forzar un resize para detectar el ancho del contenedor (ver index.js)
    var anchoGrid = anchoContenedor; // se asigna a una variable local el ancho del contenedor
    var altoGrid = $(window).height() - 350;

    if (altoGrid < 200) {
        altoGrid = 200;
    }

    var clase = 'Bloque';  // la clase que implementa el CRUD para este grid
    var idPager = 'bloque-pager';  // la barra de navegación del grid ubicada en la parte inferior

    var field1, check_function1 = function (value, colname) {
        if (colname === "nombre_bloque") {
            field1 = value;
        }
        if (value.length < 1) {

            return [false, "El codigo del bloque debe tener una longitud mayor o igual a 1  "];
        }
        else
        {
            return [true];
        }

        return [true];
    };

    // las columnas de un grid se definen como un array de objetos con múltiples atributos
    var columnas = [
        {'label': 'Bloque/Edificio', name: 'nombre_bloque', index: 'nombre_bloque', width: 200, sortable: true, editable: true, editrules: {required: true, number: false, minValue: 1, custom: true, custom_func: check_function1},
            editoptions: {dataInit: asignarAncho}
        },
        {'label': 'Sede', name: 'nombre_sede', index: 'nombre_sede', width: 200, sortable: true, editable: true, editrules: {required: true, number: false, minValue: 1}, edittype: 'select',
            editoptions: {
                dataUrl: 'controlador/fachada.php?clase=Sede&oper=getSelect',
                dataInit: asignarAncho,
                defaultValue: '0'
            }
        }
    ];

    // inicializa el grid
    var grid = jQuery('#bloque-grid').jqGrid({
        url: 'controlador/fachada.php',
        datatype: "json",
        mtype: 'POST',
        postData: {
            clase: clase,
            oper: 'select'
        },
        rowNum: 10,
        rowList: [10, 20, 30],
        colModel: columnas,
        autowidth: false,
        shrinkToFit: false,
        sortname: 'nombre_bloque', // <-- OJO pueden ir varias columnas separadas por comas
        sortorder: "asc",
        height: altoGrid,
        width: anchoGrid,
        pager: "#" + idPager,
        viewrecords: true,
        caption: "Bloque",
        multiselect: false,
        multiboxonly: true,
        hiddengrid: false,
        cellurl: 'controlador/fachada.php?clase=' + clase,
        cellsubmit: 'remote', // enviar cada entrada
        gridComplete: function () {
            // hacer algo...
        },
        loadError: function (jqXHR, textStatus, errorThrown) {
            alert('Error. No se tiene acceso a los datos de órdenes de producción.')
            console.log('textStatus: ' + textStatus);
            console.log(errorThrown);
            console.log(jqXHR.responseText);
        },
        editurl: "controlador/fachada.php?clase=" + clase
    });

    // inicializa los elementos de la barra de navegación del grid
    grid.jqGrid('navGrid', "#" + idPager, {
        refresh: true,
        edit: true,
        add: true,
        del: true,
        view: false,
        search: true,
        closeOnEscape: false
    }, {// edit
        width: 420,
        modal: true,
        afterSubmit: respuestaServidor
    }, {// add
        width: 420,
        modal: true,
        afterSubmit: respuestaServidor
    }, {// del
        width: 335,
        modal: true, // jqModal: true,
        afterSubmit: respuestaServidor
    }, {// búsqueda
        multipleSearch: true,
        multipleGroup: true}, {}
    );

    /**
     * Asigna ancho a un elemento del grid
     * @param {type} elemento El nombre del elemento 
     * @returns {undefined}
     */
    function asignarAncho(elemento) {
        $(elemento).width(260);
    }

    /**
     * Validación personalizada de los campos de un jqGrid
     * @param {type} valor el dato contenido en un campo
     * @param {type} columna nombre con que está etiquetada la columna
     * @returns {Array} un array indicando si la validación fue exitosa o no
     */
    function validarEjemplo(valor, columna) {
        if (columna == 'nombre_bloque') {
            if (valor === '0') {
                return [false, "Falta seleccionar el nombre del bloque"];
            }
        }
        if (columna == 'nombre_sede') {
            if (valor === '0') {
                return [false, "Falta seleccionar la falta el nombre la sede"];
            }
        }
        return [true, ""];
    }

});


