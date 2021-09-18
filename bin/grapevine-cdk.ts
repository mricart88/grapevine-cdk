#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { GrapevineCdkStack } from '../lib/grapevine-cdk-stack';

const app = new cdk.App();
new GrapevineCdkStack(app, 'GrapevineCdkStack');
