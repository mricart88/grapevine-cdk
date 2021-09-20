import { Bucket } from '@aws-cdk/aws-s3';
import { Construct, RemovalPolicy, SecretValue } from '@aws-cdk/core';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as cognito from '@aws-cdk/aws-cognito';
import * as codepipeline_actions from "@aws-cdk/aws-codepipeline-actions";
import * as codepipeline from "@aws-cdk/aws-codepipeline";
import * as codebuild from "@aws-cdk/aws-codebuild";
import * as acm from "@aws-cdk/aws-certificatemanager";
import * as route53 from "@aws-cdk/aws-route53";

import { S3Resources } from '../resources/s3';
import { CloudfrontResources } from '../resources/cloudfront';
import { CognitoResources } from '../resources/cognito';
import { CfnUserPoolIdentityProvider, OAuthScope, UserPoolClientIdentityProvider, UserPoolIdentityProvider, UserPoolOperation } from '@aws-cdk/aws-cognito';
import { OpenIdConnectProvider } from '@aws-cdk/aws-iam';
import { ISecret, Secret } from '@aws-cdk/aws-secretsmanager';
import { UserPoolIdentityProviderBase } from '@aws-cdk/aws-cognito/lib/user-pool-idps/private/user-pool-idp-base';

interface GrapevineReactWebAppProps {
}

export class GrapevineReactSPAWeb {
    public stage_name: string;
    public stack: Construct;
    public bucket: Bucket;
    public authorizer_edge_lambda: cloudfront.experimental.EdgeFunction;
    public cloudfront_distro: cloudfront.CloudFrontWebDistribution;
    public cognito_user_pool: cognito.UserPool;
    public cognito_client: cognito.UserPoolClient;
    public codepipeline: codepipeline.Pipeline;
    private auth0_secret: ISecret;
    private provider: CfnUserPoolIdentityProvider;

    constructor(stack: Construct, stageName: string, props?: GrapevineReactWebAppProps){
        this.stack = stack;
        this.stage_name = stageName;
        this.auth0_secret = Secret.fromSecretCompleteArn(this.stack, 'auth0Secret', 'arn:aws:secretsmanager:us-west-2:142192868872:secret:auth0-config-mZfFZu');
        // this.auth0_secret = Secret.fromSecretCompleteArn(this.stack, 'auth0Secret', 'auth0-config');
        this.bucket = this.createGrapevineWebAppBucket();
        this.codepipeline = this.createCodePipeline();
        this.cognito_user_pool = this.createCognitoUserPool();
        this.cognito_client = this.createCognitoClient();
        // this.authorizer_edge_lambda = this.createAuthLambda();
        this.cloudfront_distro = this.createCloudfrontDistro();
    }

    createGrapevineWebAppBucket(){
        // Amazon S3 bucket to store CRA website
        return S3Resources.createGrapevineWebAppBucket(this.stack, this.stage_name);
    }

    createCognitoClient(){
        const user_pool_client = CognitoResources.makeUserPoolClient(this.stack, 'GrapevineWebSPAReactUPClient', {
            userPoolClientName: 'grapevine-client',
            userPool: this.cognito_user_pool,
            oAuth: {
                scopes: [
                    OAuthScope.OPENID,
                    OAuthScope.EMAIL,
                    OAuthScope.PROFILE,
                ],
                flows: {
                    authorizationCodeGrant: true,
                    implicitCodeGrant: true
                },
            },
            // supportedIdentityProviders: 
            // supportedIdentityProviders: [
            //     // cognito.UserPoolClientIdentityProvider.COGNITO
            //     this.provider
            // ]
            
        });

        return user_pool_client;
    }
    
    createCognitoUserPool(){
        const pool = CognitoResources.makeUserPool(this.stack, 'GrapevineWebSPAReactUP', {
            userPoolName: 'grapevine-up',
            passwordPolicy: {
                minLength: 8,
                requireLowercase: true,
                requireUppercase: true,
                requireDigits: true,
                requireSymbols: true,
            },
            selfSignUpEnabled: true,
            signInAliases: {
                email: true,
            },
            autoVerify: {
                email: false,
            },
            accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
            signInCaseSensitive: false
        });


        // pool.registerIdentityProvider({
            
        // })

        pool.addDomain('GvReactDomain', {
            cognitoDomain: {
                domainPrefix: `${this.stage_name.toLowerCase() == 'beta' ? 'beta-' : ''}grapevine`
            }
        })

        this.provider = new CfnUserPoolIdentityProvider(this.stack, 'auth0LinkedinCPCidpoidc', {
            providerName: 'Auth0-Linkedin',
            userPoolId: pool.userPoolId,
            providerType: 'OIDC',
            providerDetails: {
                client_id: this.auth0_secret.secretValueFromJson('client').toString(),
                client_secret: this.auth0_secret.secretValueFromJson('secret').toString(),
                attributes_request_method: 'GET',
                oidc_issuer: this.auth0_secret.secretValueFromJson('domain').toString(),
                authorize_scopes: 'email profile openid',
                // authorize_url,
                // token_url,
                // attributes_url,
                // jwks_uri,
            }
        })

        // this.provider = new OpenIdConnectProvider(this.stack, 'UPidpauth0Li', {
        //     url: this.auth0_secret.secretValueFromJson('domain').toString(),
        //     clientIds: [
        //         this.auth0_secret.secretValueFromJson('client').toString()
        //     ]
        // });

        pool.registerIdentityProvider(UserPoolIdentityProvider.fromProviderName(this.stack, 'ProviderFromCfnGrapevineOIDCa0Li', 'Auth0-Linkedin'))

        return pool;
    }

    createAuthLambda(){
        // return CloudfrontResources.makeLambdaAtEdge()
    }

    createCloudfrontDistro(){
        const cloudFrontOAI = new cloudfront.OriginAccessIdentity(this.stack, 'ReactGVCFOaiWeb');

        const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this.stack, 'SPAdomainHz', {
            hostedZoneId: 'Z075530214XDFNXL4PH7F',
            zoneName: 'beta.appicultura.com'
        });
        const certificate = new acm.DnsValidatedCertificate(this.stack, 'SPAWebCertificate', {
            domainName: 'beta.appicultura.com',
            hostedZone: hostedZone,
            region: 'us-east-1'
        });
        const distribution = new cloudfront.CloudFrontWebDistribution(this.stack, 'MyDistribution', {
            originConfigs: [
              {
                s3OriginSource: {
                  s3BucketSource: this.bucket,
                  originAccessIdentity: cloudFrontOAI,
                },
                behaviors: [{ isDefaultBehavior: true }]
              }
            ],
            viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(certificate, {
                aliases: ['beta.appicultura.com']
            }),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS
        })
        this.bucket.grantRead(cloudFrontOAI.grantPrincipal);

        return distribution;
    }

    createCodePipeline(){
        // DOCS: https://sbstjn.com/blog/deploy-react-cra-with-cdk-codepipeline-and-codebuild/

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
            stageName: `${this.stage_name.toLowerCase()}-GVReactSPA-Source`,
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
            stageName: `${this.stage_name.toLowerCase()}-GVReactSPA-Build`,
            actions: [
                // AWS CodePipeline action to run CodeBuild project
                new codepipeline_actions.CodeBuildAction({
                    actionName: "BuildGvWeb",
                    project: new codebuild.PipelineProject(this.stack, "BuildReactWebsiteGV", {
                    projectName: "BuildGvWeb",
                    buildSpec: codebuild.BuildSpec.fromSourceFilename(
                        "./codebuild/buildspec.yml"
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