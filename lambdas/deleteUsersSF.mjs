import pkg from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const { DynamoDBDocumentClient, DeleteCommand, GetCommand } = pkg;

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);

export const handler = async (event) => {
  try {
    console.log("Event Delete User:", event);
    let userId = event.pathParameters ? event.pathParameters.id : null;

    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Se requiere un ID para eliminar un usuario", eventReq: event }),
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

    const deleteUser = await ddbDocClient.send(
      new DeleteCommand({
        TableName: "users",
        Key: { id: userId },
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: `Usuario con ID ${userId} eliminado correctamente`,
        users: deleteUser,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Ocurrió un error interno en el servidor.", error }),
    };
  }
};
