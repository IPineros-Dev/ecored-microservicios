# EcoRed Circular — Arquitectura de Microservicios Cloud Native

Aplicación web de economía circular desplegada con arquitectura de microservicios en Docker Desktop, autenticación mediante Firebase Authentication validada en el API Gateway y aplicación de los principios de **The Twelve-Factor App**.

## Componente desarrollado

- **Microservicio:** `requests-service` (Gestión de solicitudes de recolección de materiales reciclables).
- **Stack:** Node.js 24, Express y MongoDB 7 (base de datos autónoma en contenedor).
- **Ruta expuesta a través del API Gateway:** `/api/requests` (`GET`, `POST`, `PATCH /api/requests/:id/status`, `DELETE /api/requests/:id`).
- **Imagen publicada en Docker Hub:** [arancho/ecored-requests:1.0](https://hub.docker.com/r/arancho/ecored-requests)

## Imágenes Docker utilizadas

| Servicio | Imagen Docker | Origen | Puerto interno / expuesto |
| :--- | :--- | :--- | :--- |
| **Requests Service** *(propio)* | `arancho/ecored-requests:1.0` | Docker Hub | `8003` (red privada) |
| **Requests DB** *(propio)* | `mongo:7` | Docker Hub oficial | `27017` (red privada) |
| **Companies Service** *(compañero)* | `adanbeltran/ecored-companies:1.0` | Docker Hub | `8001` (red privada) |
| **Materials Service** *(compañero)* | `adanbeltran/ecored-materials:1.0` | Docker Hub | `8002` (red privada) |
| **API Gateway** | `arancho/ecored-local-gateway:1.0` *(build `./local-gateway`)* | Extendido de `adanbeltran/ecored-local-gateway:1.0` | `8080:8080` |
| **Frontend** | `arancho/ecored-frontend:1.0` *(build `./frontend`)* | Extendido de `adanbeltran/ecored-frontend:1.0` | `5173:80` |

## Arquitectura y autenticación

1. El usuario inicia sesión en el **Frontend** (`http://localhost:5173`) mediante **Firebase Authentication**.
2. El cliente HTTP adjunta el `ID Token` JWT de Firebase en la cabecera `Authorization: Bearer <token>`.
3. El **API Gateway** (`http://localhost:8080`) verifica la firma del JWT contra las claves públicas JWKS de Google antes de enrutar cualquier petición:
   - Si el token falta o es inválido, responde `401 Unauthorized`.
   - Si es válido, elimina `Authorization` y cualquier cabecera `X-User-*` entrante e inyecta `X-User-Id` y `X-User-Email` hacia los microservicios en la red privada `ecored-net`.
4. Los microservicios no exponen puertos al host; únicamente aceptan tráfico proveniente de la red interna Docker.

## Requisitos y ejecución en Docker Desktop

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/](https://github.com/)IPineros-Dev/ecored-microservicios.git
   cd ecored-microservicios