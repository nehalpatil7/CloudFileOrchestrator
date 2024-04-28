import { EC2Client, RunInstancesCommand, TerminateInstancesCommand, waitUntilInstanceRunning, DescribeInstancesCommand } from '@aws-sdk/client-ec2';
import { DynamoDBClient, UpdateItemCommand, PutItemCommand } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from "@aws-sdk/lib-dynamodb";
import SSH from 'simple-ssh';
import { readFileSync } from 'fs';


export async function handler(event, context) {
    try {
        const event_key = event?.Records[0]?.dynamodb?.Keys?.id?.S;

        const dynamoDBClient = new DynamoDBClient({ region: 'us-east-2' });
        const docClient = DynamoDBDocumentClient.from(dynamoDBClient);

        const ec2Client = new EC2Client({ region: "us-east-2" });

        const db_get_command = new GetCommand({
            TableName: "AwsCdkStack-npatil14fovuschallengedb39F4F1DF-18J3P0C3X7IO5",
            Key: {
                id: event_key,
            },
        });
        const db_obj = await docClient.send(db_get_command);
        if (db_obj?.Item?.visited == undefined) {

            const instance = new RunInstancesCommand({
                MaxCount: 1,
                MinCount: 1,
                ImageId: 'ami-09b90e09742640522',
                InstanceType: 't2.micro',
                SecurityGroupIds: ['sg-0a709bafe7fac7dac'],
                SubnetId: ['subnet-0443e0157f2a2bc04'],
                KeyName: 'fovus2',
                IamInstanceProfile: {
                    Name: "ec2_to_S3"
                },
                TagSpecifications: [
                    {
                        ResourceType: "instance",
                        Tags: [
                            {
                                Key: "Name",
                                Value: 'auto_VM',
                            },
                        ],
                    },
                ],
            });
            const response = await ec2Client.send(instance);

            const instanceId = response?.Instances[0]?.InstanceId;
            console.log(`Instance ${instanceId} created successfully.`);

            const update_command = new UpdateItemCommand({
                TableName: "AwsCdkStack-npatil14fovuschallengedb39F4F1DF-18J3P0C3X7IO5",
                Key: {
                    "id": { S: event_key },
                },
                UpdateExpression: "SET visited = :vis",
                ExpressionAttributeValues: {
                    ":vis": { BOOL: true },
                },
            });
            await docClient.send(update_command);
            console.log("Record visited succesfully.");

            const resp = await waitUntilInstanceRunning(
                {
                    client: ec2Client
                },
                {
                    Filters: [
                        {
                            Name: 'instance-id',
                            Values: [
                                instanceId,
                            ],
                        },
                    ],
                }
            );
            console.log(`Instance ${instanceId} is now running & checks passed | ${resp}`);

            const data = await ec2Client.send(new DescribeInstancesCommand({ InstanceIds: [instanceId] }));
            const instance_public_DNS = data?.Reservations[0]?.Instances[0].PublicDnsName;

            const ssh = new SSH({
                host: instance_public_DNS,
                user: 'ec2-user',
                key: readFileSync('lib/lambda_vm/fovus2.pem')
            });

            ssh.exec('curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash').exec('source ~/.bashrc').exec('nvm install --lts', {
                out: function (stdout) {
                    console.log(stdout);
                }
            }).start()

            ssh.exec('npm install @aws-sdk/client-dynamodb').exec('npm install @aws-sdk/client-s3', {
                out: function (stdout) {
                    console.log(stdout);
                }
            }).start()

            ssh.exec('wget https://awscdkstack-npatil14fovuschallengec75ed359-qyn4i8jxadmg.s3.us-east-2.amazonaws.com/script/script.mjs').exec(`node script.mjs ${event_key}`, {
                out: function (stdout) {
                    console.log(stdout);
                }
            }).start()

            const terminate_instance = new TerminateInstancesCommand({
                InstanceIds: [instanceId],
            });
            await ec2Client.send(terminate_instance);
            console.log("Terminating instances:");
        } else {
            console.log("Bad Request | Event already processed.")
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: `EC2 instance created and file downloaded successfully.`
            })
        };
    } catch (err) {
        console.error('Error:', err);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: `Error creating EC2 instance: ${err.message}`
            })
        };
    }
}