# Welcome to Kevin's CDK

This is a CDK template to help quickly bootstrap a development environment in the cloud.

## Quickstart
1. Install all dependencies
```sh
yarn
```

2. Bootstrap CDK in your particular account and region (see [instructions](https://docs.aws.amazon.com/accounts/latest/reference/manage-acct-identifiers.html) for getting your aws account )
```sh
export CDK_DEFAULT_ACCOUNT=***
export CDK_DEFAULT_REGION=us-west-2
npx cdk bootstrap aws://$ACCOUNT_NUMBER/$REGION
✅  Environment aws://***/*** bootstrapped.
```

3. Create an [ec2 key pair](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/ec2-key-pairs.html). After creating the key pair, save it in `~/.ssh/`

Make sure to update hte default permissions so its only accessible by the owner. 
`chmod 700 ~/.ssh/$KEY_PAIR`

4. Update the `.env` file with your key pair name
```sh
cp .env.template .env
# update the value of KEY_PAIR
```

5. Run a diff command to see what resources the CDK would deploy
```sh
npx cdk diff
```
You should see output similar to the following
```
Stack KevinCdkStack
IAM Statement Changes
┌───┬─────────────────────────────────┬────────┬────────────────┬───────────────────────────┬───────────┐
│   │ Resource                        │ Effect │ Action         │ Principal                 │ Condition │
├───┼─────────────────────────────────┼────────┼────────────────┼───────────────────────────┼───────────┤
│ + │ ${DevInstance/InstanceRole.Arn} │ Allow  │ sts:AssumeRole │ Service:ec2.amazonaws.com │           │
└───┴─────────────────────────────────┴────────┴────────────────┴───────────────────────────┴───────────┘
Security Group Changes
┌───┬──────────────────┬─────┬────────────┬─────────────────┐
│   │ Group            │ Dir │ Protocol   │ Peer            │
├───┼──────────────────┼─────┼────────────┼─────────────────┤
│ + │ ${devSg.GroupId} │ In  │ TCP 22     │ Everyone (IPv4) │
│ + │ ${devSg.GroupId} │ Out │ Everything │ Everyone (IPv4) │
└───┴──────────────────┴─────┴────────────┴─────────────────┘
(NOTE: There may be security-related changes not in this list. See https://github.com/aws/aws-cdk/issues/1299)

Parameters
[+] Parameter SsmParameterValue:--aws--service--ami-amazon-linux-latest--amzn2-ami-hvm-x86_64-gp2:C96584B6-F00A-464E-AD19-53AFF4B05118.Parameter SsmParameterValueawsserviceamiamazonlinuxlatestamzn2amihvmx8664gp2C96584B6F00A464EAD1953AFF4B05118Parameter: {"Type":"AWS::SSM::Parameter::Value<AWS::EC2::Image::Id>","Default":"/aws/service/ami-amazon-linux-latest/amzn2-ami-hvm-x86_64-gp2"}
[+] Parameter BootstrapVersion BootstrapVersion: {"Type":"AWS::SSM::Parameter::Value<String>","Default":"/cdk-bootstrap/hnb659fds/version","Description":"Version of the CDK Bootstrap resources in this environment, automatically retrieved from SSM Parameter Store. [cdk:skip]"}

Resources
[+] AWS::EC2::VPC KevinVPC KevinVPCF274DA6B 
[+] AWS::EC2::Subnet KevinVPC/PublicSubnet1/Subnet KevinVPCPublicSubnet1Subnet3E3203F5 
[+] AWS::EC2::RouteTable KevinVPC/PublicSubnet1/RouteTable KevinVPCPublicSubnet1RouteTableCF72F1BA 
[+] AWS::EC2::SubnetRouteTableAssociation KevinVPC/PublicSubnet1/RouteTableAssociation KevinVPCPublicSubnet1RouteTableAssociationD62AB4D9 
[+] AWS::EC2::Route KevinVPC/PublicSubnet1/DefaultRoute KevinVPCPublicSubnet1DefaultRoute2034DD5A 
[+] AWS::EC2::Subnet KevinVPC/PublicSubnet2/Subnet KevinVPCPublicSubnet2Subnet690A3E90 
[+] AWS::EC2::RouteTable KevinVPC/PublicSubnet2/RouteTable KevinVPCPublicSubnet2RouteTable158A3545 
[+] AWS::EC2::SubnetRouteTableAssociation KevinVPC/PublicSubnet2/RouteTableAssociation KevinVPCPublicSubnet2RouteTableAssociation6C7C2F13 
[+] AWS::EC2::Route KevinVPC/PublicSubnet2/DefaultRoute KevinVPCPublicSubnet2DefaultRoute07A3AF7A 
[+] AWS::EC2::Subnet KevinVPC/PublicSubnet3/Subnet KevinVPCPublicSubnet3Subnet70DB9E97 
[+] AWS::EC2::RouteTable KevinVPC/PublicSubnet3/RouteTable KevinVPCPublicSubnet3RouteTable1FF931F8 
[+] AWS::EC2::SubnetRouteTableAssociation KevinVPC/PublicSubnet3/RouteTableAssociation KevinVPCPublicSubnet3RouteTableAssociationED941E0A 
[+] AWS::EC2::Route KevinVPC/PublicSubnet3/DefaultRoute KevinVPCPublicSubnet3DefaultRouteFC78DC1C 
[+] AWS::EC2::InternetGateway KevinVPC/IGW KevinVPCIGW3985CDA8 
[+] AWS::EC2::VPCGatewayAttachment KevinVPC/VPCGW KevinVPCVPCGWE22D8138 
[+] AWS::EC2::SecurityGroup devSg devSgDEAE0C27 
[+] AWS::IAM::Role DevInstance/InstanceRole DevInstanceInstanceRole3D7479CC 
[+] AWS::IAM::InstanceProfile DevInstance/InstanceProfile DevInstanceInstanceProfile7191053A 
[+] AWS::AutoScaling::LaunchConfiguration DevInstance/LaunchConfig DevInstanceLaunchConfigB05CDF11 
[+] AWS::AutoScaling::AutoScalingGroup DevInstance/ASG DevInstanceASGDE197D91 
```

6. Deploy the template

> NOTE: this will ask for your approval to create IAM groups
```sh
npx cdk deploy 

# to deploy while skipping approval, add "--require-approval never"
npx cdk deploy --require-approval never
```

7. This stack generally will deploy in under 5 minutes. After the instance has shifted to a ready state, you can ssh into the instance using the following command where `PUBLIC_IP` is the pulic ip of your ec2 instance. 

```sh
ssh -i ~/.ssh/$KEY_PAIR ec2-user@$PUBLIC_IP
```
