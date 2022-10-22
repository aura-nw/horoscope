import { DbAdapter } from 'moleculer-db';

export interface IDbAdapterCustom extends DbAdapter {
	countWithSkipLimit(query: any): any;
	aggregate(param: any): any;
	lean(param: any): any;
	useDb(dbname: string): void;
}
