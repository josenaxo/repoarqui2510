# Servicio health

Walking skeleton de la migración serverless. Demuestra arquitectura limpia/hexagonal:

- `application/`: caso de uso independiente de AWS.
- `ports/`: contrato del repositorio.
- `adapters/in/`: Lambda para API Gateway HTTP API.
- `adapters/out/`: acceso a DynamoDB.

## Rutas

- `GET /health`: pública.
- `GET /health/privado`: protegida por Cognito.

## Probar

```powershell
npm.cmd test
npm.cmd run typecheck
npx.cmd serverless deploy --stage rol1
```
