import pkg from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const { DynamoDBDocumentClient, GetCommand, PutCommand } = pkg;

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);


export const handler = async (event) => {
  try {

    let userId = event.pathParameters?.id;
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere un ID para actualizar un usuario." }),
      };
    }

    const body = JSON.parse(event.body);
    if (!body.nombre || !body.cedula) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere  'nombre' y 'cedula' para actualizar el usuario." }),
      };
    }

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: "users",
        Key: { id: userId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: `Usuario con ID ${userId} no encontrado` }),
      };
    }

    if (body.nombre) result.Item.nombre = body.nombre;
    if (body.cedula) result.Item.cedula = body.cedula;

    await ddbDocClient.send(
      new PutCommand({
        TableName: "users",
        Item: result.Item,
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Usuario con ID '${userId}' actualizado correctamente.`,
        user: result.Item,
      }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Ocurrió un error interno en el servidor.", error }),
    };
  }
};
