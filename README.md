# RIU-Frontend-David-Fernandez

Prueba técnica frontend — Mindata  
**Stack:** Angular 20 · Angular Material · Signals · Standalone components · Docker

---

## Requisitos

- Node 22 LTS
- npm 10+
- Docker + Docker Compose (opcional, para producción)

---

## Instalación y desarrollo

```bash
npm install
npm start          # http://localhost:4200
```

---

## Tests

```bash
# Modo watch (desarrollo)
npm test

npm run test:ci
```
---

## Docker

```bash
# Build y arranque con docker-compose
docker compose up --build

# O directamente con Docker
docker build -t superheroes-app .
docker run -p 4200:80 superheroes-app
```

La app queda disponible en **http://localhost:4200**

---



