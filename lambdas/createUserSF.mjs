import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { randomUUID } from "crypto";
import pkg from "@aws-sdk/lib-dynamodb";

const { DynamoDBDocumentClient, PutCommand, GetCommand } = pkg;

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);

export const handler = async (event) => {
  try {
   
    const body = typeof event.body === "string" ? JSON.parse(event.body) : event.body;

    if (!body.nombre || !body.cedula) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: "Los campos 'nombre' y 'cedula' son obligatorios." }),
      };
    }

    console.log("BODY USER :::::::::::-----------:::::::::::", body);

    const userId = randomUUID();
    const newUser = {
      id: userId,
      /*...body*/
      nombre: body.nombre,
      cedula: body.cedula,
    };

    await ddbDocClient.send(
      new PutCommand({
        TableName: "users",
        Item: newUser,
      })
    );

    const result = await ddbDocClient.send(
      new GetCommand({
        TableName: "users",
        Key: { id: userId },
      })
    );

    if (!result.Item) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "El usuario no se encontró después de ser creado." }),
      };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Usuario creado correctamente.",
        user: result.Item,
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Ocurrió un error interno en el servidor.", error }),
    };
  }
};

