import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { AutoScalingGroup, EbsDeviceVolumeType } from "aws-cdk-lib/aws-autoscaling";
import * as dotenv from 'dotenv' 
import { IpAddresses } from 'aws-cdk-lib/aws-ec2';
dotenv.config()

export class KevinCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = this.createVPC()
    this.createDevInstance({vpc});
  }

  createDevInstance(opts: {vpc: ec2.Vpc}) {
    const devSg = new ec2.SecurityGroup(this, "devSg", {
      vpc: opts.vpc,
    });
    // ssh port
    devSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22));

    // example of adding an ingress port 
    // devSg.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(3003), "nango port");

    // instance type
    const instanceType = ec2.InstanceType.of(
            ec2.InstanceClass.R6A,
            ec2.InstanceSize.XLARGE
        );
    const userData = this.createUserData();

    // create autoscaling group
    const asg = new AutoScalingGroup(this, "DevInstance", {
      vpc: opts.vpc,
      instanceType,
      machineImage: ec2.MachineImage.latestAmazonLinux({
        generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      }),
      keyName: process.env.KEY_PAIR,
      allowAllOutbound: true,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PUBLIC,
      },
      securityGroup: devSg,
      blockDevices: [
        {
          deviceName: "/dev/xvda",
          volume: {
            ebsDevice: {
              volumeSize: 100,
              deleteOnTermination: false,
              volumeType: EbsDeviceVolumeType.GP2,
            }
          }
        },
      ],
      userData,
    });
  }

  createUserData() {
    const userData = ec2.UserData.forLinux();
    userData.addCommands(
      // add docker
      `yum install docker -y`,
      `sudo service docker start`,
      `sudo usermod -a -G docker ec2-user`,
      `newgrp docker`,
      // enable docker buildx
      `mkdir -vp /home/ec2-user/.docker/cli-plugins/`,
      `curl --silent -L "https://github.com/docker/buildx/releases/download/v0.3.0/buildx-v0.3.0.linux-amd64" > ~/.docker/cli-plugins/docker-buildx`,
      `chmod a+x ~/.docker/cli-plugins/docker-buildx`,
      // enable dev tools
      `yum install -y git`,
      // upgrade yum
      "yum check-update -y",
      "yum upgrade -y", 
    );
    return userData;
  }

  createVPC() {
    const vpc = new ec2.Vpc(this, 'KevinVPC', {
      // 'cidr' configures the IP range and size of the entire VPC.
      // The IP space will be divided over the configured subnets.
      ipAddresses: IpAddresses.cidr('10.0.0.0/21'),

      // 'maxAzs' configures the maximum number of availability zones to use
      maxAzs: 3,
      natGateways: 0,
      // 'subnetConfiguration' specifies the "subnet groups" to create.
      // Every subnet group will have a subnet for each AZ, so this
      // configuration will create `3 groups × 3 AZs = 9` subnets.
      subnetConfiguration: [
        {
          // 'subnetType' controls Internet access, as described above.
          subnetType: ec2.SubnetType.PUBLIC,
          name: 'Public',
          // 'cidrMask' specifies the IP addresses in the range of of individual
          // subnets in the group. Each of the subnets in this group will contain
          // `2^(32 address bits - 24 subnet bits) - 2 reserved addresses = 254`
          // usable IP addresses.
          //
          // If 'cidrMask' is left out the available address space is evenly
          // divided across the remaining subnet groups.
          cidrMask: 24,
        },
        {
          cidrMask: 28,
          name: 'Isolated',
          subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
          // 'reserved' can be used to reserve IP address space. No resources will
          // be created for this subnet, but the IP range will be kept available for
          // future creation of this subnet, or even for future subdivision.
          reserved: true
        }
      ],
    });
    return vpc;
  }
}
