import { constants } from 'http2';

// eslint-disable-next-line no-shadow, @typescript-eslint/naming-convention
export enum ErrorMessage {
	SUCCESSFUL = 'Successful',
	NOT_FOUND = 'notfound',
	WRONG = 'wrong',
	NOT_ACTIVE = 'notactive',
	DUPLICATED_LOGIN = 'user.duplicated.login',
	DUPLICATED_EMAIL = 'user.duplicated.email',
	DELETE_ITSELF = 'user.delete.itself',
	ADDRESS_NOT_FOUND = 'Address not found',
	CRAWL_SUCCESSFUL = 'Data is preparing! Please call API again in a few minutes',
	VALIDATION_ERROR = 'Validation error',
}

export const ErrorCode = {
	SUCCESSFUL: constants.HTTP_STATUS_OK,
	NOT_FOUND: constants.HTTP_STATUS_NOT_FOUND,
	WRONG: constants.HTTP_STATUS_UNPROCESSABLE_ENTITY,
	NOT_ACTIVE: constants.HTTP_STATUS_FORBIDDEN,
	DUPLICATED_LOGIN: constants.HTTP_STATUS_UNPROCESSABLE_ENTITY,
	DUPLICATED_EMAIL: constants.HTTP_STATUS_UNPROCESSABLE_ENTITY,
	DELETE_ITSELF: constants.HTTP_STATUS_UNPROCESSABLE_ENTITY,
	ADDRESS_NOT_FOUND: 'E001',
};
