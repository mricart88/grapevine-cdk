import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, SecretValue } from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cognito from '@aws-cdk/aws-cognito';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codebuild from "@aws-cdk/aws-codebuild";

import { GrapevineStage } from '../../grapevine-stage';
import { S3Resources } from '../resources/s3';
import { CloudfrontResources } from '../resources/cloudfront';
import { CognitoResources } from '../resources/cognito';

interface GrapevineReactWebAppProps {
}

export class GrapevineReactSPAWeb {
    public stage: GrapevineStage;
    public stack: Construct;
    public bucket: Bucket;
    public authorizer_edge_lambda: cloudfront.experimental.EdgeFunction;
    public cloudfront_distro: cloudfront.CloudFrontWebDistribution;
    public cognito_user_pool: cognito.UserPool;
    public cognito_client: cognito.UserPoolClient;
    public codepipeline: codepipeline.Pipeline;

    constructor(stack: Construct, stage: GrapevineStage, props?: GrapevineReactWebAppProps){
        this.stack = stack;
        this.stage = stage;

        this.bucket = this.createGrapevineWebAppBucket();
        this.codepipeline = this.createCodePipeline();
        // this.cognito_user_pool = this.createCognitoUserPool();
        // this.cognito_client = this.createCognitoClient();
        // this.authorizer_edge_lambda = this.createAuthLambda();
        this.cloudfront_distro = this.createCloudfrontDistro();
    }

    createGrapevineWebAppBucket(){
        // Amazon S3 bucket to store CRA website
        return S3Resources.createGrapevineWebAppBucket(this.stack, this.stage);
    }

    createCognitoClient(){
        return CognitoResources.makeUserPoolClient(this.stack, 'GrapevineWebSPAReactUPClient', {
            userPoolClientName: 'grapevine-client',
            userPool: this.cognito_user_pool
        });
    }
    
    createCognitoUserPool(){
        return CognitoResources.makeUserPool(this.stack, 'GrapevineWebSPAReactUP', {
            userPoolName: 'grapevine-up'
        });
    }

    createAuthLambda(){
        // return CloudfrontResources.makeLambdaAtEdge()
    }

    createCloudfrontDistro(){
        const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this.stack, 'ReactGVCFOaiWeb');

        const distribution = new cloudfront.CloudFrontWebDistribution(this.stack, 'MyDistribution', {
            originConfigs: [
              {
                s3OriginSource: {
                  s3BucketSource: this.bucket,
                  originAccessIdentity: cloudFrontOAI,
                },
                behaviors: [{ isDefaultBehavior: true }]
              }
            ]
        })
        this.bucket.grantRead(cloudFrontOAI.grantPrincipal);

        return distribution;
    }

    createCodePipeline(){
        // AWS CodePipeline pipeline
        const pipeline = new codepipeline.Pipeline(this.stack, "GvSPAReactCodePipeline", {
            pipelineName: "WebReactSPAGv",
            restartExecutionOnUpdate: true
        });

        // AWS CodeBuild artifacts
        const outputSources = new codepipeline.Artifact();
        const outputWebsite = new codepipeline.Artifact();


        // SOURCE
        pipeline.addStage({
            stageName: `${this.stage.stageName.toLowerCase()}-GVReactSPA-Source`,
            actions: [
                new codepipeline_actions.GitHubSourceAction({
                    actionName: "Checkout",
                    owner: 'mricart88',
                    repo: 'grapevine-web',
                    oauthToken: SecretValue.secretsManager("github-token"),
                    output: outputSources,
                    trigger: codepipeline_actions.GitHubTrigger.WEBHOOK,
                })
            ]
        })

        // BUILD
        pipeline.addStage({
            stageName: `${this.stage.stageName.toLowerCase()}-GVReactSPA-Build`,
            actions: [
                // AWS CodePipeline action to run CodeBuild project
                new codepipeline_actions.CodeBuildAction({
                    actionName: "BuildGvWeb",
                    project: new codebuild.PipelineProject(this.stack, "BuildReactWebsiteGV", {
                    projectName: "BuildGvWeb",
                    buildSpec: codebuild.BuildSpec.fromSourceFilename(
                        "../resources/buildspec.yml"
                    ),
                    }),
                    input: outputSources,
                    outputs: [outputWebsite],
                }),
            ]
        });

        // DEPLOY
        // AWS CodePipeline stage to deployt CRA website and CDK resources
        pipeline.addStage({
            stageName: "Deploy",
            actions: [
            // AWS CodePipeline action to deploy CRA website to S3
            new codepipeline_actions.S3DeployAction({
                actionName: "GvWebReactDeploy",
                input: outputWebsite,
                bucket: this.bucket,
            }),
            ],
        });

        return pipeline;
    }
}