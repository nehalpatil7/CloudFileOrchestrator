import { nanoid } from 'nanoid';
import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb';

export const handler = async (event, context) => {
    try {
        if (!event) {
            throw new Error('Request body is missing');
        }

        const dynamoDBClient = new DynamoDBClient({
            region: 'us-east-2',
            credentials: {
                accessKeyId: "xxxxxxxxxxxxxxxxxxxxxx",
                secretAccessKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
            },
        });

        const requestBody = JSON.parse(JSON.stringify(event, null, 2));

        const id = nanoid();
        const dynamoDBParams = {
            TableName: 'AwsCdkStack-npatil14fovuschallengedb39F4F1DF-18J3P0C3X7IO5',
            Item: {
                id: { S: id },
                input_text: { S: requestBody['inputText'] },
                input_file_path: { S: requestBody['inputFileS3Path'] },
            },
        };

        await dynamoDBClient.send(new PutItemCommand(dynamoDBParams));

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Data saved successfully' }),
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Internal server error' }),
        };
    }
};
