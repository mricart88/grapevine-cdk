import * as cloudfront from '@aws-cdk/aws-cloudfront';
import { Construct } from '@aws-cdk/core';

export class CloudfrontResources {
  static makeCloudfrontDistro(stack: Construct, id: string, opts: cloudfront.DistributionProps){
    return new cloudfront.Distribution(stack, id, opts);
  }

  static makeLambdaAtEdge(stack: Construct, id: string, opts: cloudfront.experimental.EdgeFunctionProps){
    return new cloudfront.experimental.EdgeFunction(stack, id, opts);
  }
}