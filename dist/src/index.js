import { Obj3D } from './Obj3D.js';
import { CvHLines } from './CvHLines.js';
import { Rota3D } from './Rota3D.js';
import { Point3D } from './point3D.js';
var lienzo;
var graficos;
lienzo = document.getElementById('circlechart');
graficos = lienzo.getContext('2d');
var visor;
var objeto3D;
var intervaloSatelite = undefined;
var tiempoIntervaloSatelite = 80; // ms, menor = más rápido
function establecerIntervaloSatelite() {
    if (intervaloSatelite)
        clearInterval(intervaloSatelite);
    intervaloSatelite = setInterval(function () {
        moverSatelite();
    }, tiempoIntervaloSatelite);
}
function leerArchivo(e) {
    var archivo = e.target.files[0];
    if (!archivo)
        return;
    var lector = new FileReader();
    lector.onload = function (e) {
        var contenido = e.target.result;
        mostrarContenido(contenido);
        objeto3D = new Obj3D();
        if (objeto3D.read(contenido)) {
            visor = new CvHLines(graficos, lienzo);
            visor.setObj(objeto3D);
            visor.paint();
            tiempoIntervaloSatelite = 80;
            establecerIntervaloSatelite();
        }
    };
    lector.readAsText(archivo);
}
function mostrarContenido(contenido) {
    var elemento = document.getElementById('contenido-archivo');
    elemento.innerHTML = contenido;
}
function cambiarVista(dTheta, dPhi, fRho) {
    if (objeto3D != undefined) {
        var obj = visor.getObj();
        if (!obj.vp(visor, dTheta, dPhi, fRho))
            alert('Datos no válidos');
    }
    else {
        alert('Aún no has leído un archivo');
    }
}
function vistaAbajo() { cambiarVista(0, 0.1, 1); }
function vistaArriba() { cambiarVista(0, -0.1, 1); }
function vistaIzquierda() { cambiarVista(-0.1, 0, 1); }
function vistaDerecha() { cambiarVista(0.1, 0, 1); }
function aumentarDistancia() { cambiarVista(0, 0, 2); }
function disminuirDistancia() { cambiarVista(0, 0, 0.5); }
// Movimiento de traslación del satélite alrededor del planeta
function moverSatelite() {
    var angulo = 10; // grados
    var centroPlaneta = objeto3D.w[3927]; // vértice del planeta
    var ejeZ = new Point3D(centroPlaneta.x, centroPlaneta.y, centroPlaneta.z + 1);
    Rota3D.initRotate(centroPlaneta, ejeZ, angulo * Math.PI / 180);
    // Rotar todos los vértices del satélite (387 a 3926)
    for (var i = 387; i <= 3926; i++) {
        objeto3D.w[i] = Rota3D.rotate(objeto3D.w[i]);
    }
    // Rotar el vértice guía del satélite si es necesario
    objeto3D.w[3928] = Rota3D.rotate(objeto3D.w[3928]);
    visor.setObj(objeto3D);
    visor.paint();
}
// Eventos
document.getElementById('file-input').addEventListener('change', leerArchivo, false);
document.getElementById('eyeDown').addEventListener('click', vistaAbajo, false);
document.getElementById('eyeUp').addEventListener('click', vistaArriba, false);
document.getElementById('eyeLeft').addEventListener('click', vistaIzquierda, false);
document.getElementById('eyeRight').addEventListener('click', vistaDerecha, false);
document.getElementById('incrDist').addEventListener('click', aumentarDistancia, false);
document.getElementById('decrDist').addEventListener('click', disminuirDistancia, false);
// Solo movimiento del satélite
document.getElementById('pza1Der').addEventListener('click', moverSatelite, false);
var xInicial, yInicial;
var xFinal, yFinal;
var flag = false;
function manejarMouse(evento) {
    xInicial = evento.offsetX;
    yInicial = evento.offsetY;
    flag = true;
}
function visualizar(evento) {
    if (flag) {
        xFinal = evento.offsetX;
        yFinal = evento.offsetY;
        var difX = xInicial - xFinal;
        var difY = yFinal - yInicial;
        cambiarVista(0, 0.1 * difY / 50, 1);
        yInicial = yFinal;
        cambiarVista(0.1 * difX, 0 / 50, 1);
        xInicial = xFinal;
    }
}
function noDibujar() {
    flag = false;
}
window.addEventListener('DOMContentLoaded', function () {
    fetch('prueba1_estructurado_3_limpio.txt')
        .then(function (response) { return response.text(); })
        .then(function (contenido) {
        mostrarContenido(contenido);
        objeto3D = new Obj3D();
        if (objeto3D.read(contenido)) {
            visor = new CvHLines(graficos, lienzo);
            visor.setObj(objeto3D);
            visor.paint();
            tiempoIntervaloSatelite = 80;
            establecerIntervaloSatelite();
        }
    })
        .catch(function (err) {
        console.error('No se pudo cargar el archivo por defecto:', err);
    });
});
