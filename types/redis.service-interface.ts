export interface IMessage {
	source?: String;
	element: String;
}

export interface IRedisStreamData {
	id: String;
	message: IMessage;
}
export interface IRedisStreamResponse {
	name: String;
	messages: IRedisStreamData[];
}
