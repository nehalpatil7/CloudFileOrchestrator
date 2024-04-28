# fovusChallenge
## Fovus Full-stack SDE Challenge
### Integrating React, AWS (EC2, S3, DynamoDB, Lambda), Git

- AWS Region = us-east-2 (Ohio)
- S3 bucket name = arn:aws:s3:::awscdkstack-npatil14fovuschallengec75ed359-qyn4i8jxadmg
- IAM username = nehal_fovus_challenge
- IAM password = Nehal-fovus
- key2 | access key = AKIASZWORN6LGI77JGW3 | secret = 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


### Steps
1. Clone the repo - both folders are different applications.
2. _my-react-app_ is the frontend application.
  - Install Node
  - Run > npm i
  - Run > npm start
  - App opens on localhost:3000
3. _aws_cdk_ is the backend/provisioning code.
  - Install Node
  - Install AWS CLI
  - Configure AWS CLI
  - Run > npm i
  - Navigate to LAMBDA functions
  - Inside both function directories = Run > npm i
  - Navigate back to parent dir
  - Run > cdk bootstrap
  - Run > cdk synth
  - Run > cdk deploy
4. Remember to change the bucked_ids, dynamo_db_ids, APi_Gateway URLs before trying to execute the app.
5. May have to change some IAM roles/permissions manually.
6. Use the frontend application to execute commands.
7. You can use the CloudWatch Monitor to see logs of how the code is performing.
8. ENJOY ---!!!---







### References
- https://dynobase.dev/dynamodb-aws-cdk/#:~:text=With%20AWS%20CDK%2C%20you%20can,2%20properties%3A%20partitionKey%20and%20billingMode%20.&text=DynamoDB%20provides%202%20billing%20modes,the%20billingMode%20property%20to%20dynamodb.
- https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/loading-node-credentials-iam.html
- https://www.youtube.com/results?search_query=attach+iam+role+automatically+to+new+vm
- https://www.youtube.com/results?search_query=how+to+download+s3+files+in+ec2
- https://www.npmjs.com/package/simple-ssh
- https://stackoverflow.com/questions/36300446/ssh-permission-denied-publickey-gssapi-with-mic
- https://docs.aws.amazon.com/cli/latest/reference/ec2/describe-instances.html
- https://www.perplexity.ai/search/After-the-file-OhoMTdeZTeOI1slPIdJfjw
- https://github.com/awsdocs/aws-doc-sdk-examples/blob/main/javascriptv3/example_code/ec2/actions/describe-instances.js
- https://aws.amazon.com/blogs/compute/scheduling-ssh-jobs-using-aws-lambda/
