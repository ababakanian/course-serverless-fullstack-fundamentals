import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as s3 from "aws-cdk-lib/aws-s3";

class ImageGallery extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);

    // example resource
    new s3.Bucket(this, "OriginalSizeImagesBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });

    new s3.Bucket(this, "ThumbnailSizeImagesBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
      versioned: true,
    });
  }
}

class PhotoManagement extends Construct {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    new ImageGallery(this, "photoAlbumGallery");
  }
}

export class TempCdkStackStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // create two image galleries
    // new ImageGallery(this, "firstCustomStorage");
    // new ImageGallery(this, "secondCustomStorage");

    // create one photo management construct
    new PhotoManagement(this, "photoManagement");
  }
}
