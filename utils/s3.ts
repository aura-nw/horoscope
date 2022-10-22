// import { ConfigService } from 'src/shared/services/config.service';
import { Config } from '../common';
import { S3 } from 'aws-sdk';

export class S3Service {
//   private _configService = new Config();
  private AWS_ACCESS_KEY_ID: string;
  private AWS_SECRET_ACCESS_KEY: string;
  private AWS_REGION: string;

  constructor() {
    this.AWS_ACCESS_KEY_ID = Config.AWS_ACCESS_KEY_ID;
    this.AWS_SECRET_ACCESS_KEY = Config.AWS_SECRET_ACCESS_KEY;
    this.AWS_REGION = Config.AWS_REGION;
  }

  public connectS3() {
    return new S3({
      accessKeyId: this.AWS_ACCESS_KEY_ID,
      region: this.AWS_REGION,
      secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
    });
  }
}