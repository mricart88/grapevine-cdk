import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';
import { CdkPipeline } from '@aws-cdk/pipelines';
import { GrapevineStage } from '../../grapevine-stage';

export class S3Resources {
    public stage: GrapevineStage;
    public stack: Construct;
    public grapevine_web_app_bucket: Bucket;

    constructor(stack: Construct, stage: GrapevineStage){
        this.stack = stack;
        this.stage = stage;
    }

    static createGrapevineWebAppBucket(stack: Construct, stage: GrapevineStage){
        // Amazon S3 bucket to store CRA website
        return new Bucket(stack, "GrapevineWebAppBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            bucketName: `${stage.stageName.toLowerCase()}-grapevine-web-app-bucket`
        });
    }
}