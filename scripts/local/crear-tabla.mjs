const endpoint = process.env.DYNAMO_ENDPOINT ?? 'http://localhost:8000'
const tableName = process.env.TABLE_NAME ?? 'ceibbo-app-local'

const { DynamoDBClient, CreateTableCommand, DescribeTableCommand, PutItemCommand } = await import('@aws-sdk/client-dynamodb')
const client = new DynamoDBClient({
  endpoint,
  region: process.env.AWS_REGION ?? 'us-east-1',
  credentials: { accessKeyId: 'local', secretAccessKey: 'local' },
})

try {
  await client.send(new DescribeTableCommand({ TableName: tableName }))
  console.log(`La tabla ${tableName} ya existe.`)
} catch {
  await client.send(new CreateTableCommand({
    TableName: tableName,
    BillingMode: 'PAY_PER_REQUEST',
    AttributeDefinitions: [
      { AttributeName: 'PK', AttributeType: 'S' },
      { AttributeName: 'SK', AttributeType: 'S' },
      { AttributeName: 'GSI1PK', AttributeType: 'S' },
      { AttributeName: 'GSI1SK', AttributeType: 'S' },
    ],
    KeySchema: [
      { AttributeName: 'PK', KeyType: 'HASH' },
      { AttributeName: 'SK', KeyType: 'RANGE' },
    ],
    GlobalSecondaryIndexes: [{
      IndexName: 'GSI1',
      KeySchema: [
        { AttributeName: 'GSI1PK', KeyType: 'HASH' },
        { AttributeName: 'GSI1SK', KeyType: 'RANGE' },
      ],
      Projection: { ProjectionType: 'ALL' },
    }],
  }))
  console.log(`Tabla ${tableName} creada.`)
}

await client.send(new PutItemCommand({
  TableName: tableName,
  Item: { PK: { S: 'HEALTH' }, SK: { S: 'HEALTH' } },
}))
console.log('Ítem HEALTH sembrado.')
