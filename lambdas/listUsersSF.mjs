import pkg from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const { DynamoDBDocumentClient, ScanCommand } = pkg;

const ddbDocClient = DynamoDBDocumentClient.from(
  new DynamoDBClient({ region: "us-east-1" })
);

export const handler = async (event) => {
  try {

    const result = await ddbDocClient.send(
      new ScanCommand({
        TableName: "users",
      })
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        message: "Usuarios obtenidos correctamente",
        users: result.Items,
      }),
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Ocurrió un error interno en el servidor.", error }),
    };
  }
};
