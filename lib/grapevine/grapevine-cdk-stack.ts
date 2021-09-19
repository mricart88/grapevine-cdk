import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';

import { GrapevineReactSPAWeb } from './constructs/grapevine-react-spa-s3';

export class GrapevineCdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, stageName: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    // new s3.Bucket(this, 'id', {
    //   bucketName: 'test-buck19773562',
    //   removalPolicy: cdk.RemovalPolicy.DESTROY
    // })
    new s3.Bucket(this, 'gvDiscoverBuck', {
      bucketName: 'grapevine-discover',
      removalPolicy: cdk.RemovalPolicy.DESTROY
    })

    // new GrapevineReactSPAWeb(this, stageName);

  }
}
