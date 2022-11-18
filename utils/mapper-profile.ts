export class MapperProfile {
	private mapValue: any = {};
	private arrPros: any = [];

	/**
	 * mapProperties
	 * @param f
	 * @returns
	 */
	public mapProperties(f: (x: any) => any) {
		this.mapValue = [];
		let express = new Proxy(
			{},
			{
				get(target, prop) {
					return prop;
				},
			},
		);

		const pros = f(express);
		if (pros instanceof Array) {
			this.arrPros = pros;
		}
		return this;
	}

	/**
	 * fromProperties
	 * @param f
	 * @returns
	 */
	public fromProperties(f: (x: any) => any): any {
		let express = new Proxy(
			{},
			{
				get(target, prop) {
					return prop;
				},
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
