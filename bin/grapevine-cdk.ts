#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GrapevineCdkStack } from '../lib/grapevine/grapevine-cdk-stack';
// import { CdkpipelinesDemoPipelineStack } from '../lib/cdkpipelines-demo-pipeline-stack';
import { GrapevinePipelineStack } from '../lib/grapevine-pipeline-stack';

const app = new cdk.App();
// new GrapevineCdkStack(app, 'GrapevineCdkStack');

const pipeline = new GrapevinePipelineStack(app, 'CdkpipelinesDemoPipelineStack', {
  env: { account: '142192868872', region: 'us-east-2' },
});

app.synth();