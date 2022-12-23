export interface IMessage {
	source?: string;
	element: string;
}

export interface IRedisStreamData {
	id: string;
	message: IMessage;
}
export interface IRedisStreamResponse {
	name: string;
	messages: IRedisStreamData[];
}
