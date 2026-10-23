param(
  [ValidateSet('rol1', 'rol2', 'rol3', 'demo', 'dev')]
  [string]$Stage = 'dev'
)

$ErrorActionPreference = 'Stop'
$repo = Resolve-Path (Join-Path $PSScriptRoot '..\..')
$targets = @('infra/shared', 'services/health', 'services/perfiles', 'services/habilidades', 'services/postulaciones')

aws sts get-caller-identity | Out-Host
foreach ($target in $targets) {
  $directory = Join-Path $repo $target
  Write-Host "Desplegando $target en stage $Stage..."
  Push-Location $directory
  try {
    npm.cmd ci --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw "Falló npm ci en $target" }
    npx.cmd serverless deploy --stage $Stage
    if ($LASTEXITCODE -ne 0) { throw "Falló el despliegue de $target" }
  } finally {
    Pop-Location
  }
}
