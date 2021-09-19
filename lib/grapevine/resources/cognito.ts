import * as cognito from '@aws-cdk/aws-cognito';
import { Construct } from '@aws-cdk/core';

export class CognitoResources {
    // Cognito + auth0 + LinkedIn
    // DOCS: https://aws.amazon.com/premiumsupport/knowledge-center/cognito-linkedin-auth0-social-idp/
    static makeUserPool (stack: Construct, id: string, opts: cognito.UserPoolProps) {
        return new cognito.UserPool(stack, id, opts);
    }

    static makeUserPoolClient (stack: Construct, id: string, opts: cognito.UserPoolClientProps) {
        return new cognito.UserPoolClient(stack, id, opts);
    }
}