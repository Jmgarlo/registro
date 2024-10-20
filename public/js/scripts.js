document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/alumnos');
    const alumnos = await response.json();
    
    const tbody = document.querySelector('#tablaAlumnos tbody');
    tbody.innerHTML = '';

    alumnos.forEach(alumno => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${alumno.nombre}</td>
            <td>${alumno.correo}</td>
            <td>${alumno.telefono}</td>
            <td>${alumno.dni}</td>
            <td>${alumno.curso}</td>
            <td>${alumno.direccion}</td>
            <td><img src="${alumno.foto}" alt="Foto de ${alumno.nombre}" style="width: 50px; height: auto;"></td>
        `;

        tbody.appendChild(tr);
    });
});
