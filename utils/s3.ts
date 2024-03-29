/* eslint-disable @typescript-eslint/naming-convention */
// Import { ConfigService } from 'src/shared/services/config.service';
// import { S3 } from 'aws-sdk';

import { Config } from '../common';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const AWS = require('aws-sdk');

export class S3Service {
	//   Private _configService = new Config();
	private AWS_ACCESS_KEY_ID: string;
	private AWS_SECRET_ACCESS_KEY: string;
	private AWS_REGION: string;
	private S3_CLIENT: any;
	public constructor() {
		this.AWS_ACCESS_KEY_ID = Config.AWS_ACCESS_KEY_ID;
		this.AWS_SECRET_ACCESS_KEY = Config.AWS_SECRET_ACCESS_KEY;
		this.AWS_REGION = Config.AWS_REGION;
		this.S3_CLIENT = new AWS.S3({
			accessKeyId: this.AWS_ACCESS_KEY_ID,
			region: this.AWS_REGION,
			secretAccessKey: this.AWS_SECRET_ACCESS_KEY,
		});
	}

	public connectS3() {
		return this.S3_CLIENT;
	}
}
