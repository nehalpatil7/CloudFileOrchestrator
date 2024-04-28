import { DynamoDBClient, GetItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
    region: 'us-east-2',
    credentials: {
        accessKeyId: "AKIASZWORN6LGI77JGW3",
        secretAccessKey: "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",
    },
});
const dynamoDBClient = new DynamoDBClient({ region: 'us-east-2' });

try {
    const key = process.argv[2];

    const params = {
        TableName: 'AwsCdkStack-npatil14fovuschallengedb39F4F1DF-18J3P0C3X7IO5',
        Key: { id: { S: key } }
    };

    const Item = await dynamoDBClient.send(new GetItemCommand(params));

    if (Item) {
        console.log('Record found:');

        const s3Params = {
            Bucket: 'awscdkstack-npatil14fovuschallengec75ed359-qyn4i8jxadmg',
            Key: Item?.Item?.file_name?.S
        };
        const file_obj = await s3Client.send(new GetObjectCommand(s3Params));
        const str = await file_obj?.Body?.transformToString();
        const merged_str = str.concat(" \n ", Item?.Item?.input_text?.S);
        console.log(merged_str);

        const uploadParams = { ...s3Params, Body: merged_str };
        const resp_data = await s3Client.send(new PutObjectCommand(uploadParams));

        console.log("Successfully uploaded data to bucket at | " + Item?.Item?.file_name?.S);

        const tableUploadParams = {
            TableName: 'AwsCdkStack-npatil14fovuschallengedb39F4F1DF-18J3P0C3X7IO5',
            Item: {
                'id': { S: Item?.Item?.id?.S },
                'input_file_path': { S: `s3://${s3Params.Bucket}/${s3Params.Key}` }
            }
        };
        await dynamoDBClient.send(new PutItemCommand(tableUploadParams));

        console.log("Data inserted into table | ");


    } else {
        console.log('Record not found');
    }
} catch (error) {
    console.error('Error fetching record:', error);
    throw error;
}
