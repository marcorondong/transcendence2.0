interface Chat {
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

interface ChatUser {
	id: string;
	messages: string[];
}

interface MessageResponse {
	message: string;
	relatedId: string;
	type: string;
}
