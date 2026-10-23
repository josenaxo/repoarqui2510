# Servicio perfiles

Servicio serverless independiente para CU-01/CU-02. Mantiene perfiles y personalización por colegio, usa Cognito como puerto de identidad y DynamoDB como adaptador de persistencia.

```powershell
npm.cmd test
npm.cmd run typecheck
npx.cmd serverless deploy --stage rol3
```

Rutas: `POST /perfiles`, `GET|PUT /perfiles/me` y `GET|PUT /colegios/{id}/config`.
