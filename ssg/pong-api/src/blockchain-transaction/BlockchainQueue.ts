import { BlockchainData } from "./BlockchainData";

export class BlockchainQueue {
	static queue: BlockchainData[] = [];
	static isProcessing = false;

	static putMatchInQue(gameResult: BlockchainData) {
		this.queue.push(gameResult);
		this.processQueue();
	}

	private static async processQueue() {
		if (this.isProcessing) return;
		this.isProcessing = true;
		while (this.queue.length > 0) {
			const item = this.queue.shift();
			if (!item) continue;
			try {
				await item.putOnBlockchain();
			} catch (err) {
				console.error("❌ Error putting match on blockchain:", err);
				// Optionally push `item` back to retry
			}
		}
		this.isProcessing = false;
	}
}
