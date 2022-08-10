import { DbAdapter } from 'moleculer-db';

export interface IDbAdapterCustom extends DbAdapter {
	countWithSkipLimit(query: any): any;
}
