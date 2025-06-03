export type State = "success" | "error" | "info";

export interface NotificationData {
	message: string;
	state: State;
}
