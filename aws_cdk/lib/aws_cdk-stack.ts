import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { DynamoEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';


export class AwsCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new s3.Bucket(this, 'npatil14fovuschallenge', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const npatil14fovuschallengedb = new dynamodb.Table(this, 'npatil14fovuschallengedb', {
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });
    // new cdk.CfnOutput(this, 'FileTableArn', { value: npatil14fovuschallengedb.tableArn });

    const lambdaFunction = new lambda.Function(this, 'Function', {
      code: lambda.Code.fromAsset('lib/lambda_vm'),
      handler: 'index.handler',
      functionName: 'TableStreamHandler',
      runtime: lambda.Runtime.NODEJS_LATEST
    });

    // lambdaFunction.addEventSource(new DynamoEventSource(npatil14fovuschallengedb, {
    //   startingPosition: lambda.StartingPosition.LATEST,
    // }));

    // const uploadToS3Function = new lambda.Function(this, 'UploadToS3Function', {
    //   runtime: lambda.Runtime.NODEJS_LATEST,
    //   handler: 'index.handler',
    //   code: lambda.Code.fromAsset('lambda/upload-to-s3'),
    //   environment: {
    //     BUCKET_NAME: bucket.bucketName,
    //   },
    // });
    // bucket.grantWrite(uploadToS3Function);

    const saveToDynamoDBFunction = new lambda.Function(this, 'SaveToDynamoDBFunction', {
      runtime: lambda.Runtime.NODEJS_LATEST,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('lib/lambda'),
      environment: {
        TABLE_NAME: npatil14fovuschallengedb.tableName,
      },
    });
    npatil14fovuschallengedb.grantWriteData(saveToDynamoDBFunction);

    const api = new apigateway.RestApi(this, 'npatil14fovuschallengeAPi');

    // const uploadToS3Integration = new apigateway.LambdaIntegration(uploadToS3Function);
    // api.root.addResource('upload').addMethod('POST', uploadToS3Integration);

    const saveToDynamoDBIntegration = new apigateway.LambdaIntegration(saveToDynamoDBFunction);
    api.root.addResource('save').addMethod('POST', saveToDynamoDBIntegration);

  }
}
