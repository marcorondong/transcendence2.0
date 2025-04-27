interface Chat {
	type: string;
	relatedId?: string;
	roomId?: string;
	notification?: string;
	blockStatus?: boolean;
	peopleOnline?: string[];
	error?: string;
}

interface ChatUser {
	id: string;
	messages: string[];
}
