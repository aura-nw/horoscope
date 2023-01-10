import { Config } from "../../../../common";
import { Types } from 'mongoose';

export const codeId = {
    _id: new Types.ObjectId(),
    custom_info: {
        chain_id: Config.CHAIN_ID,
        chain_name: "Aura Devnet"
    },
    "contract_type": "CW721",
    "code_id": "176",
    "status": "TBD",
    "createdAt": new Date(),
    "updatedAt": new Date(),
}