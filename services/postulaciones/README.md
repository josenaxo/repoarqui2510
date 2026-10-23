# Servicio postulaciones

Implementa el núcleo de CU-04 a CU-07. La escritura condicional garantiza que un estudiante no pueda postular dos veces y SQS recibe `PostulacionCreada`.

```powershell
npm.cmd test
npm.cmd run typecheck
npx.cmd serverless deploy --stage rol1
```

Rutas: `POST|GET /oportunidades`, `POST /oportunidades/{id}/postulaciones`, `GET /postulaciones/me` y `GET /oportunidades/{id}/postulantes`.
