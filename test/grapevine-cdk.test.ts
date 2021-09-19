import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import * as cdk from '@aws-cdk/core';
import * as GrapevineCdk from '../lib/grapevine/grapevine-cdk-stack';

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new GrapevineCdk.GrapevineCdkStack(app, 'MyTestStack', 'Test');
    // THEN
    // expectCDK(stack).to(matchTemplate({
    //   "Resources": {}
    // }, MatchStyle.SUPERSET))
});
