# DEV

<!-- ls stacks -->
npx cdk ls
<!-- Deploy Stack -->
STACK=Pipeline/Beta/Grapevine && npx cdk deploy $STACK --profile grapevine

<!-- Bootstrap new account/regions for stage -->
npx cdk bootstrap \
  --profile grapevine \
  --trust 142192868872 \
  --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess \
  aws://142192868872/us-west-2

# Welcome to your CDK TypeScript project!

This is a blank project for TypeScript development with CDK.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

 * `npm run build`   compile typescript to js
 * `npm run watch`   watch for changes and compile
 * `npm run test`    perform the jest unit tests
 * `cdk deploy`      deploy this stack to your default AWS account/region
 * `cdk diff`        compare deployed stack with current state
 * `cdk synth`       emits the synthesized CloudFormation template
