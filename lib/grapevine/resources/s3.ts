import { Bucket } from '@aws-cdk/aws-s3';
import { Construct } from '@aws-cdk/core';

export class S3Resources {
    public stage_name: string;
    public stack: Construct;
    public grapevine_web_app_bucket: Bucket;

    constructor(stack: Construct, stageName: string){
        this.stack = stack;
        this.stage_name = stageName;
    }

    static createGrapevineWebAppBucket(stack: Construct, stageName: string){
        // Amazon S3 bucket to store CRA website
        return new Bucket(stack, "GrapevineWebAppBucket", {
            websiteIndexDocument: "index.html",
            websiteErrorDocument: "error.html",
            bucketName: `${stageName.toLowerCase()}-grapevine-web-app-bucket`
        });
    }
}