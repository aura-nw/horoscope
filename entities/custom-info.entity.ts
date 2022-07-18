export interface ICustomInfo {
    chain_id: String;
    chain_name: String;
}

export class CustomInfo implements ICustomInfo {
    chain_id: String = '';
    chain_name: String = '';
}