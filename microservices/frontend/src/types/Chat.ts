export interface Chat {
	id?: string;
	type: string;
	users?: User[];
	me?: User;
	sender?: User;
	receiver?: User;
	user?: User;
	roomId?: string;
	notification?: string;
	blockStatus?: boolean;
	peopleOnline?: string[];
	error?: string;
	message?: string;
}

export interface Message {
	type?: string;
	sender?: User;
	receiver?: User;
	message: string;
	dateTime?: Date;
	invitation?: boolean;
}

export interface User {
	id: string;
	nickname: string;
}

export interface ChatUser {
	id: string;
	nickname: string;
	messages: Message[];
	blocked: boolean;
	blockStatusChecked: boolean;
}
