<%-- 
    Document   : index
    Created on : 27/08/2025, 08:01:54
    Author     : informatica
--%>
<%@page contentType="text/html" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>Juego de Rompecabezas</title>
        <link rel="stylesheet" href="Styles/rompecabezas.css">
    </head>
    <body>
        <div class="container">
            <h2>Rompecabezas 3x3</h2>
            <p>Haz clic en un número adyacente al espacio vacío para moverlo</p>
            <div id="puzzle" class="puzzle"></div>
            <p id="mensaje"></p>
            <button onclick="reiniciar()">Reiniciar</button>
        </div>
        <script src="Scripts/rompecabezas.js"></script>
    </body>
</html>