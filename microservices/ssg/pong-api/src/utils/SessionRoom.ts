import { EventEmitter } from "stream";
import { WebSocket } from "ws";

export class SessionRoom extends EventEmitter {
	protected connections: Set<WebSocket>;
	protected readonly creationDate: Date;

	constructor() {
		super();
		this.connections = new Set<WebSocket>();
		this.creationDate = new Date();
	}

	getCreationDate(): Date {
		return this.creationDate;
	}

	addConnectionToRoom(connectionToAdd: WebSocket): void {
		this.connections.add(connectionToAdd);
	}

	removeAllConnectionsFromRoom(): void {
		for (const oneConnection of this.connections) {
			this.removeConnectionFromRoom(oneConnection);
			console.log("Removing connection from room");
		}
	}

	closeAllConnectionsFromRoom(): void {
		for (const oneConnection of this.connections) {
			oneConnection.close();
		}
	}

	/**
	 * send same message to all player in room
	 * @param message message to send
	 */
	roomBroadcast(message: string): void {
		for (const oneConnection of this.connections) {
			oneConnection.send(message);
		}
	}

	private removeConnectionFromRoom(connectionToRemove: WebSocket): boolean {
		return this.connections.delete(connectionToRemove);
	}
}
