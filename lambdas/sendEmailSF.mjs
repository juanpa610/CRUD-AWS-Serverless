import AWS from 'aws-sdk';
import { GetParameterCommand, SSMClient } from "@aws-sdk/client-ssm";

const sns = new AWS.SNS();
const ssmClient = new SSMClient({});

export const handler = async (event) => {
    try {
        const TOPIC_ARN = process.env.TOPIC_ARN;

        const parameResult = await ssmClient.send(
            new GetParameterCommand({ Name: TOPIC_ARN })
        );

        const TOPIC_ARN_VALUE = parameResult.Parameter.Value;

        const body = JSON.parse(event.body);
        const { message, subject } = body;

        const params = {
            Subject: subject,
            Message: message,
            TopicArn: TOPIC_ARN_VALUE
        };

        const response = await sns.publish(params).promise();
        console.log('Mensaja enviado :', response);


        return {
            statusCode: 200,
            body: JSON.stringify({ 
                message: 'Mensaje enviado correctamente',
                responseSendEmail: response
            }),
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Ocurrió un error interno en el servidor.", error }),
        };
    }
};
