export interface Chat {
	type: string;
	relatedId?: string;
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

export interface ChatUser {
	id: string;
	messages: Message[];
	blocked: boolean;
}

export interface MessageResponse {
	message: string;
	relatedId: string;
	type: string;
}
