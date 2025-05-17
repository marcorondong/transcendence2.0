export interface Chat {
	id?: string;
	type: string;
	users?: User[];
	me?: User;
	user?: User;
	roomId?: string;
	notification?: string;
	blockStatus?: boolean;
	peopleOnline?: string[];
	error?: string;
	message?: string;
	messageResponse?: MessageResponse;
}

export interface Message {
	id: string;
	content: string;
	invitation?: string;
	dateTime?: Date;
}

export interface User {
	id: string;
	nickname: string;
}

export interface ChatUser {
	id: string;
	// TODO: make this mandatory
	nickname?: string;
	messages: Message[];
	blocked: boolean;
}

export interface MessageResponse {
	message: string;
	relatedId: string;
	type: string;
}
