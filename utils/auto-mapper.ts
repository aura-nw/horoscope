import { MapperProfile } from './mapper-profile';

export class AutoMapperUtil {
	private static _mapperProfile: MapperProfile;

	/**
	 * Create mapper
	 * @returns
	 */
	public static createMap() {
		if (!this._mapperProfile) {
			this._mapperProfile = new MapperProfile();
		}
		return this._mapperProfile;
	}

	/**
	 * map
	 * @param mapConfig
	 * @param source
	 * @returns
	 */
	public static map(mapConfig: any, source: any): any {
		const result: any = {};
		for (const [key, value] of Object.entries(mapConfig)) {
			result[key] = source[`${value}`];
		}
		return result;
	}

	/**
	 * mapEntity
	 * @param mapConfig
	 * @param entity
	 * @param source
	 * @returns
	 */
	public static mapEntity(mapConfig: any, entity: any, source: any): any {
		for (const [key, value] of Object.entries(mapConfig)) {
			entity[key] = source[`${value}`];
		}
		return entity;
	}
}
