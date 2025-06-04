export interface Chat {
<<<<<<< HEAD:frontend/volume/typescript/types/Chat.ts
	type: string;
	relatedId?: string;
=======
	id?: string;
	type: string;
	users?: User[];
	me?: User;
	sender?: User;
	receiver?: User;
	user?: User;
>>>>>>> main:microservices/frontend/volume/typescript/types/Chat.ts
	roomId?: string;
	notification?: string;
	blockStatus?: boolean;
	peopleOnline?: string[];
	error?: string;
	message?: string;
<<<<<<< HEAD:frontend/volume/typescript/types/Chat.ts
	messageResponse?: MessageResponse;
}

export interface Message {
	id: string;
	content: string;
	invitation?: string;
	dateTime?: Date;
=======
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
>>>>>>> main:microservices/frontend/volume/typescript/types/Chat.ts
}

export interface ChatUser {
	id: string;
<<<<<<< HEAD:frontend/volume/typescript/types/Chat.ts
	messages: Message[];
	blocked: boolean;
}

export interface MessageResponse {
	message: string;
	relatedId: string;
	type: string;
=======
	nickname: string;
	messages: Message[];
	blocked: boolean;
	blockStatusChecked: boolean;
>>>>>>> main:microservices/frontend/volume/typescript/types/Chat.ts
}
