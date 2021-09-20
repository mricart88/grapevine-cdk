import { Construct, Stack, StackProps } from '@aws-cdk/core';
import { CodePipeline, CodePipelineSource, ShellStep } from "@aws-cdk/pipelines";

import { GrapevineStage } from './grapevine-stage';

/**
 * The stack that defines the application pipeline
  DOCS: https://aws.amazon.com/blogs/developer/cdk-pipelines-continuous-delivery-for-aws-cdk-applications/
 */
export class GrapevinePipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      // The pipeline name
      pipelineName: 'CdkPipeline',

       // How it will be built and synthesized
       synth: new ShellStep('Synth', {
         // Where the source can be found
         input: CodePipelineSource.gitHub('mricart88/grapevine-cdk', 'master'),
         
         // Install dependencies, build and run cdk synth
         commands: [
            'npx yarn install --frozen-lockfile',
            'npx yarn build',
            'npx cdk synth'
         ],
       }),
    });
    // for stage in stages{
    const stage = new GrapevineStage(this, 'Beta', {
        env: { account: '142192868872', region: 'us-west-2' }
    });

    pipeline.addStage(stage);

    // This is where we add the application stages
    // ...
  }
}