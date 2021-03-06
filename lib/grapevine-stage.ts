import { CfnOutput, Construct, Stage, StageProps } from '@aws-cdk/core';
import { GrapevineCdkStack } from './grapevine/grapevine-cdk-stack';

/**
 * Deployable unit of web service app
 */
export class GrapevineStage extends Stage {
  public readonly urlOutput: CfnOutput;
  
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);

    const service = new GrapevineCdkStack(this, 'Grapevine', this.stageName, undefined);
    // Expose CdkpipelinesDemoStack's output one level higher
    // this.urlOutput = service.urlOutput;
  }
}