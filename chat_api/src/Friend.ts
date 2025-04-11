export class Friend {
	private friendName: string;
	private block: boolean;

	constructor(friendName: string, block: boolean = false) {
		this.friendName = friendName;
		this.block = block;
	}

	getFriendName(): string {
		return this.friendName;
	}

	getBlock(): boolean {
		return this.block;
	}

	setFriendName(friendName: string): void {
		this.friendName = friendName;
	}

	setBlock(block: boolean): void {
		this.block = block;
	}
}
