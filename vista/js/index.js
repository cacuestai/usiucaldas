/* 
 * Control de opciones para generales de la aplicación
 * Se quiere que las instrucciones que hay dentro de la función anónima function () {..};
 * se ejecuten cuando la aplicación haya sido cargada, por eso se usa on ready:
 * $(document).on('ready', function () {...});
 * los demás script de páginas sólo requerirán la función principal
 */

'use strict';

var initDatePicker = {
    dateFormat: 'yy-mm-dd hh:ii',
    minDate: new Date(2015, 0, 1),
    maxDate: new Date(2025, 0, 1),
    showOn: 'focus'
};

var initDateTimePicker = {// ver http://xdsoft.net/jqplugins/datetimepicker/
    step: 30, // listado de horas con cambio cada media hora
    format: 'Y-m-d H:i',
    //datepicker: false, para desplegar horas solamente
    opened: false
};

var anchoContenedor;
var tipoDoc;
var diasSemana;
var estadosEquipos;
var tipoReserva;
var referenciaActual; // una referencia del menú actual

$(document).on('ready', function () {

    $.datetimepicker.setLocale('es');

    cargarPagina("#index-menu", "vista/html/menu-basico.html", inicializarMenu);

    // ajustes para el formulario de autenticación
    $("#index-frmautentica").estiloFormulario({
        anchoEtiquetas: '90px',
        anchoEntradas: '200px',
        claseFormulario: 'divForm'
    }).dialog({
        autoOpen: false,
        width: 396,
        modal: true,
        resizable: false,
        open: function () {
//          $(".ui-dialog-titlebar-close").hide();  // << para cuando se requiera ocultar el botón de cerrar
            var anchoLista = ($('#index-frmautentica > ol > li').width() - 10) + 'px';
            $("#index-iniciar-sesion, #index-activar-cuenta").button().css('width', anchoLista);
        },
    });

    // Gestión del evento "Autenticarse"
    $("#index-iniciar-sesion").button().on("click", function () {
        autenticar().then(function (respuesta) {
            console.log(respuesta);
            if (respuesta.ok) {
                if (respuesta.rol) {
                    if (respuesta.rol === 'administrativo') {
                        cargarPagina("#index-menu", "vista/html/menu-administrador.html", inicializarMenu);
                    }
                }
                $("#index-frmautentica").dialog("close");
            } else {
                if (respuesta.hasOwnProperty("mensaje")) {
                    mostrarMensaje(respuesta.mensaje, '#index-mensaje-inicio');
                } else {
                    mostrarMensaje('No se ha recibido una respuesta válida', '#index-mensaje-inicio');
                }
            }
        });
    });

    function autenticar() {
        var deferred = $.Deferred();

        $.blockUI({message: getMensaje('Verificando usuario')});
        $.post("controlador/fachada.php", {
            clase: "Usuario",
            oper: 'autenticar',
            idUsuario: $("#index-nombre-usuario").val(),
            contrasena: $.md5($('#index-contrasena').val())
        }, function (data) {
            deferred.resolve(data);
        }, 'json').fail(function () {
            mostrarMensaje("No se pudo realizar la autenticación del usuario", '#index-mensaje-inicio');
        }).always(function () {
            $.unblockUI();
        });
        return deferred.promise();
    }

    // un ejemplo de uso de selectores jQuery para controlar eventos sobre links
    $("#index-menu-superior li a").each(function () {
        var opcion = $(this).text();

        $(this).on('click', function (event) {
            switch (opcion) {
                case "Actualidad":
                    window.open('http://www.ucaldas.edu.co/portal/');
                    break;
                default:
                    alert('La opción <' + opcion + '> no está disponible');
            }
            event.preventDefault();
        })
    })  // fin de $("#index-menu-superior li a").each(function () {...})

    // otro ejemplo de uso de selectores jQuery para controlar eventos sobre links
    $("#index-pie_pagina a").each(function () {
        var opcion = $(this).text();

        $(this).on('click', function (event) {
            switch (opcion) {
                default:
                    alert('La opción <' + opcion + '> no está disponible');
            }
            event.preventDefault();
        });
    });

    $.post("controlador/fachada.php", {
        clase: 'UtilConexion',
        oper: ['getTipoReserva', 'getTipoDocumento', 'getDiasSemana', 'getEstadosEquipos']
    }, function (data) {
        tipoReserva = data[0];
        tipoDoc = data[1];
        diasSemana = data[2];
        estadosEquipos = data[3];
    }, 'json');

    // cada que se redimensione el navegador se actualiza anchoContenedor
    $(window).on('resize', function () {
        anchoContenedor = $(window).width() - 220;
        $('.ui-jqgrid-btable').each(function () {
            $(this).jqGrid('setGridWidth', anchoContenedor);
        });
    });


});

/**
 * Carga el contenido de una página sobre un elemento del DOM
 * @param {type} contenedor El elemento sobre el que se mostrará la página html
 * @param {type} url La dirección de la página html que será mostrada
 * @param {type} accion Opcional El nombre de una función que deba ejecutarse luego de cargar la página
 * @returns {undefined}
 */
function cargarPagina(contenedor, url, accion) {
    $(contenedor).load(url, function (response, status, xhr) {
        if (status === "error") {
            alert("Lo siento. Error " + xhr.status + ": " + xhr.statusText);
        } else {
            if (typeof accion === 'function') {
                accion();
            }
        }
    });
}

function inicializarMenu() {
    $('#menu-principal').smartmenus({
        mainMenuSubOffsetX: 1,
        mainMenuSubOffsetY: -8,
        subMenusSubOffsetX: 1,
        subMenusSubOffsetY: -8
    });

    $('#menu-principal li a').each(function () {
        var opcion = $(this).text();        // el nombre de una opción del menú
        var pagina = $(this).attr('href');  // recupera el nombre de la página y...
        $(this).attr('href', '');           // convierte la url en una 'url limpia'

        $(this).on('click', function (event) {
            referenciaActual = $(this).attr('id');
//            console.log("pagina : "+pagina);
            if ($(this).attr('title') === 'Guardar cambios') {
                guardarCambios();
            } else if (opcion === "Cerrar sesión") {
                $.post("controlador/fachada.php", {
                    clase: 'Usuario',
                    oper: 'cerrarSesion'
                }, function () {
//                    También podría ser: location.reload(true);
//                     if (opciones[opcion]) {  // si la opción no está bloqueada...
                    window.location.href = "index.html";
//                    }
                });
            } else if (opcion === "Autenticarse") {
                $("#index-frmautentica").dialog("open");
            } else {
                cargarPagina("#index-contenido", pagina);
            }
            event.preventDefault();
        });
    });
}
/**
 * Esta función se requiere a nivel global para procesar la respuesta que recibe un objeto jqGrid desde el servidor
 * @param {type} response Una cadena JSON con el estado y el mensaje que envía el servidor luego de procesar una acción
 * @param {type} postdata Los datos que envía jqGrid al servidor
 * @returns {Array} La respuesta del estado de la operación para mostrarla como error si fuese necesario
 */
function respuestaServidor(response, postdata) {
    console.log(postdata)
    var respuesta = jQuery.parseJSON(response.responseText);
    console.log(respuesta);
    return [respuesta.ok, "El servidor no pudo completar la acción"];
}


/**
 * Muestra un mensaje por unos segundos...
 * @param {type} mensaje El texto del mensaje
 * @param {type} elemento El DIV que contendrá el mesaje
 * @returns {undefined}
 */
function mostrarMensaje(mensaje, elemento) {
    mensaje = mensaje + '<br>';
    $(elemento).html(mensaje).show().effect("highlight", {color: '#FA5858'}, 4000).promise().then(function () {
        $(this).hide();
    });
}

/**
 * Devuelve un mensaje formateado para bloquear el sistema mediante BlockUI
 * @param {type} mensaje El texto que se va a formatear
 * @returns {String} el HTML de la cadena formateada
 */
function getMensaje(mensaje) {
    return '<h4><img src="vista/imagenes/ajax-loader.gif"><br>' + mensaje + '<br>Por favor espere...</h4>';
}

function getElementos(parametros) {
    var asincrono, aviso, elementos = new Object(), tipoDatos, url;
    aviso = ("aviso" in parametros) ? parametros['aviso'] : false;
    asincrono = ("async" in parametros) ? parametros['async'] : false;
    tipoDatos = ("tipoDatos" in parametros) ? parametros['tipoDatos'] : "json";
    url = ("url" in parametros) ? parametros['url'] : "controlador/fachada.php";

    $.ajax({
        type: "POST",
        url: url,
        beforeSend: function (xhr) {
            if (aviso) {
                // $.blockUI({message: getMensaje(aviso)});
            }
        },
        data: parametros,
        async: asincrono,
        dataType: tipoDatos
    }).done(function (data) {
        elementos = data;
    }).fail(function () {
        // console.log("Error de carga de datos: " + JSON.stringify(parametros));
        alert("Error de carga de datos");
    }).always(function () {
        if (aviso) {
            // $.unblockUI();
        }
    });
    return elementos;
}

jQuery.fn.estiloFormulario = function (valoresEstilos) {
    var div = this;
    jQuery(this).each(function () {
        var idDiv = $(this).attr('id');
        var item;
        if ($('#' + idDiv + '> ol').length) {
            item = '#' + idDiv + '>ol>li>';
        } else {
            item = '#' + idDiv + '>';
        }

        var estilo = {
            'claseFormulario': '',
            'anchoFormulario': '700px',
            'anchoEtiquetas': '100px',
            'anchoEntradas': '550px',
            'alturaTextArea': '90px',
            'tamanioFuente': '100%',
            'fondo': "url('vista/imagenes/fondo1.jpg') repeat"
        };
        if (typeof (valoresEstilos) === 'object') {
            if (estilo.anchoFormurio === valoresEstilos && estilo.anchoFormulario !== '700px') {
                valoresEstilos = 0
            }
            estilo = $.extend(true, estilo, valoresEstilos);
        }

        $('#' + idDiv).addClass(estilo.claseFormulario);
        $(this).css({
            "font-size": estilo.tamanioFuente,
            "font-family": "Helvetica, sans-serif",
            "width": estilo.anchoFormulario,
            "margin-top": "5px",
            "background": estilo.fondo
        });
        $(item + 'input,' + item + 'textarea,' + item + 'select').css({
            'padding': '5px',
            'width': estilo.anchoEntradas,
            'font-family': 'Helvetica, sans-serif',
            'font-size': estilo.tamanioFuente,
            'margin': '0px 0px 2px 0px',
            'border': '1px solid #ccc'
        });
        $('#' + idDiv + ' :button').css({
            'width': (parseInt(estilo.anchoEntradas) + 11) + 'px'
        });
        // es raro...el ancho de los select no guarda la misma proporción de los otros componentes y hay que hacer ajustes
        $(item + 'select').each(function () {
            if (typeof this.attributes['multiple'] === 'undefined') {
                $(this).css({'width': (parseInt(estilo.anchoEntradas)) + 'px', 'display': 'block'});
            } else {
                // suponiendo un select formateado con el plugin multiselect de Eric Hynds
                $(this).css('width', (parseInt(estilo.anchoEntradas) + 6) + 'px');
            }
        });
        $(item + 'textarea').css("height", estilo.alturaTextArea);
        $(item + 'input,' + item + 'textarea,' + item + 'select').on('focus', function () {
            $(this).css("border", "1px solid #900");
        });
        $(item + 'input,' + item + 'textarea,' + item + 'select').on('blur', function () {
            $(this).css("border", "1px solid #ccc");
        });
        $(item + 'label').css({
            'float': 'left',
            'text-align': 'right',
            'margin-right': '15px',
            'width': estilo.anchoEtiquetas,
            'padding-top': '5px',
            'font-size': estilo.tamanioFuente
        });
        ////  excluir este tipo en los estilos anteriores por ahora dejarlo así/////////////////////
        $(item + 'input:checkbox').css({
            'margin-top': '10px',
            'width': 10
        });
        $(item + 'input,' + item + 'label,' + item + 'button,' + item + 'textarea').css('display', 'block');
    });
    return div;
};