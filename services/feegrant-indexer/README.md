# Feegrant

## Architecture
![image](docs/images/feegrant.png)

| **Service**             	| **Function**                                                                                             	|
|---------------------	|------------------------------------------------------------------------------------------------------	|
| Feegrant tx handler 	| Query N (config file) consecutive blocks’s transactions each period (config file):<br>- Filter transactions which relates to feegrant<br>- Classify each feegrant’s transaction to types ( create, revoke, use, create by using another feegrant, revoke by using another feegrant, use up)|
| Feegrant action (history) DB service| For each new action:<br>- create: origin_feegrant_txhash = tx_hash → save to Feegrant DB (new grant)<br>- use: origin_feegrant_txhash = null (unprocessed flag) → save to Feegrant actions DB<br>- revoke: origin_feegrant_txhash = null (unprocessed flag) → save to Feegrant actions DB|
| Crontask update original | Get all unprocessed records use and rovoke (origin_feegrant_txhash  = null) and find its original create, update origin_feegrant_txhash. Emit those records. Repeat each period (config file)|
|Feegrant DB service| Receive all unprocessed actions from Crontask. Calculate and update feegrants corespond with each action. Use ⇒ update spendable, Revoke ⇒ update status to revoke, Use up ⇒ Update status to Use up|

## Filter feegrant transactions

| **Type transaction**	| **Action**                          | **Status**                                      |
|:---------------------:|:---------------------------------------:|:---------------------------------------:|
|create|create|Available|
|use|use|Available|
|revoke|revoke|Revoked|
|use up|1: use<br>2: revoke| 1: Use up<br> 2: Use up|
|create with feegrant| 1: create<br>2: use | 1: Available<br>2: Available|
|revoke with feegrant| 1: revoke<br>2: use | 1: Revoked<br>2: Available |
|create fail| creat| Fail|

## Data
| **Field**	| **Type**                          | **Description**                                      |
|---------------------|---------------------------------------|---------------------------------------|
| _id | ObjectID \| null | identification |
| tx_hash | String | tx_hash of this action |
| origin_feegrant_txhash | String | original feegrant of this action |
| granter | String | granter of this action |
| grantee | String | grantee of this action |
| result |Boolean|true if transaction success, otherwise fail|
| type |String|if this action is creat, type is allowance type: Basic, Periodic, AllowMsgs, AllowContracts, else ""|
| timestamp | String | action's time |
| spend_limit | amount: String<br>denom: String | allowance limit |
|expiration| String | allowance expiration|
| amount | amount: String<br>denom: String | if<br>create: spend_limit<br>use: fee in transaction<br>useup: feegrant fee in transaction<br>revoke: null<br>_create: spend_limit<br>_revoke: null|
| status | String | feegrant status|
| action | String |action: create, use, useup, revoke, _create, _revoke|
|custom_info| customInfoModel | chain info |

