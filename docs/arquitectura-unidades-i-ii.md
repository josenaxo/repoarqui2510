# Adaptación de Ceibbo hasta la Unidad II

## Alcance y estrategia de migración

El frontend Next.js se conserva. El backend NestJS/PostgreSQL queda como referencia funcional mientras los dominios se extraen mediante el patrón Strangler Fig. La arquitectura objetivo usa servicios AWS administrados y funciones Lambda independientes. Esto permite migrar por dominio sin reescribir toda la aplicación de una vez.

```text
Next.js
   |
   v
API Gateway HTTP API -- Cognito JWT
   |---- Lambda health ---------|
   |---- Lambda perfiles -------|--> DynamoDB (tabla única + GSI1)
   |---- Lambda habilidades ----|--> SQS --> DLQ
   `---- Lambda postulaciones --|--> S3 privado (uso posterior)
                                  `--> CloudWatch
```

## Unidad I - patrones de diseño

### Patrones en la nube

- Strangler Fig: `backend/` sigue disponible y `services/` contiene los dominios extraídos.
- Database per service lógica: cada servicio es dueño de sus prefijos PK/SK aunque comparta una tabla física por costo académico.
- Event-driven: habilidades y postulaciones publican contratos versionados en SQS.
- Idempotencia: las escrituras condicionales impiden habilidades o postulaciones duplicadas.
- DLQ y reintentos: la cola compartida mueve el mensaje después de cinco recepciones fallidas.

### Arquitectura serverless

`infra/shared/serverless.yml` declara DynamoDB on-demand, S3 privado, SQS/DLQ, Cognito y HTTP API. Cada carpeta de `services/` posee su `serverless.yml`, Lambda, pruebas y ciclo de despliegue independiente sobre Node.js 22.

### Clean Architecture

Cada servicio separa:

- `domain/`: entidades y reglas sin dependencias de AWS.
- `application/`: casos de uso que reciben puertos.
- `ports/`: contratos de persistencia, identidad o eventos.
- `adapters/in/`: handlers de API Gateway.
- `adapters/out/`: DynamoDB, Cognito y SQS.

Las pruebas sustituyen los adaptadores con dobles en memoria y no requieren AWS ni Docker.

## Unidad II - estrategias de implementación

### Modelos de servicio en la nube

- FaaS: AWS Lambda ejecuta los casos de uso.
- Servicios administrados: API Gateway, Cognito, DynamoDB, SQS, S3 y CloudWatch reducen operación de servidores.
- SaaS/PaaS de frontend: Next.js puede hospedarse en Vercel o Amplify; la decisión no acopla los dominios.
- IaaS no es necesaria para esta fase: no se usan EC2, RDS ni NAT Gateway, lo que protege el presupuesto de Learner Lab.

### Dockerización

`docker-compose.yml` levanta PostgreSQL para el monolito existente y DynamoDB Local para probar los nuevos adaptadores. No se empaquetan Lambdas en contenedores: se despliegan como artefactos Node.js porque es el modelo más simple y económico para Learner Lab.

### Implementación estándar

```powershell
.\scripts\aws\deploy-standard.ps1 -Stage rol1
```

El orden es infraestructura compartida, health, perfiles, habilidades y postulaciones. Cada stack es independiente y reutiliza los outputs del stack compartido.

### Implementación canaria

Los scripts de `scripts/canario/` publican una versión Lambda, mantienen la estable en el alias y envían 10 % a la candidata. `docs/canario.md` define promoción, rollback y umbrales. La automatización con CI/CD se reserva para Unidad III.

## Ejecución local

Modo inmediato, sin base de datos:

```powershell
npm.cmd run setup
npm.cmd run dev
```

La interfaz queda en `http://localhost:3000` y usa cuentas demo. Para el stack heredado completo:

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env.local
npm.cmd run local:up
npm.cmd run dev:full
```

Para verificar la adaptación:

```powershell
npm.cmd run doctor
npm.cmd run verify:unit2
```
