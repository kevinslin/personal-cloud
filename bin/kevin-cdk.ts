#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { KevinCdkStack } from '../lib/kevin-cdk-stack';

const app = new cdk.App();
new KevinCdkStack(app, 'KevinCdkStack', {
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: process.env.CDK_DEFAULT_REGION },
});