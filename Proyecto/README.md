## Requisitos

- Node.js 24 o posterior
- MongoDB local o Atlas

## Iniciar el API

Sigue los pasos del [README del API](../NodeJS/proyecto-api/README.md): configura tu .env, instala dependencias, ejecuta el seed y levanta el servidor.

## Iniciar Angular

```bash
npm install
npm start
```

## Vistas

- `/`: inicio y catálogo público
- `/login` y `/registro`: autenticación de clientes y administradores
- `/agendar` y `/agendar/:id`: reservar o modificar una cita
- `/mis-citas` y `/perfil`: citas y datos de la cuenta
- `/admin`, `/admin/citas`, `/admin/servicios`, `/admin/barberos`, `/admin/clientes` y `/admin/horarios`
