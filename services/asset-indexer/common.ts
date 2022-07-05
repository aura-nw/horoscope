/* eslint-disable @typescript-eslint/explicit-member-accessibility */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
'use strict';

import { Types } from "mongoose";

type AssetInfo = {
    data: {
        access: {
            owner: String;
        };
    };
};

export class Common {
	public static createAssetObject = function (code_id: Number, address: String, id: String, tokenInfo: AssetInfo) {
        return {
            _id: new Types.ObjectId(),
            asset_id: `${address}_${id}`,
            code_id: code_id,
            asset_info: tokenInfo,
            constract_address: address,
            token_id: id,
            owner: tokenInfo.data.access.owner,
            history: [],
        };
    }
}