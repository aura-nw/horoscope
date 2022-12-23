/* eslint-disable @typescript-eslint/naming-convention */
export class MapperProfile {
	private mapValue: any = {};
	private arrPros: any = [];

	/**
	 * MapProperties
	 * @param f
	 * @returns
	 */
	public mapProperties(f: (x: any) => any) {
		this.mapValue = [];
		const express = new Proxy(
			{},
			{
				get: (target, prop) => prop,
			},
		);

		const pros = f(express);
		if (pros instanceof Array) {
			this.arrPros = pros;
		}
		return this;
	}

	/**
	 * FromProperties
	 * @param f
	 * @returns
	 */
	public fromProperties(f: (x: any) => any): any {
		const express = new Proxy(
			{},
			{
				get: (target, prop) => prop,
			},
		);
		const pros = f(express);
		if (pros instanceof Array) {
			pros.map((key, index) => {
				this.mapValue[`${this.arrPros[index]}`] = `${key}`;
			});
		}
		return this.mapValue;
	}
}
