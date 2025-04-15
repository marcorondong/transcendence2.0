import { BlockchainData } from "./BlockchainData";

export class BlockchainQueue {
	static queue: BlockchainData[] = [];
	static isProcessing = false;

	static putMatchInQue(gameResult: BlockchainData) {
		this.queue.push(gameResult);
		this.processQueue();
	}

	private static async processQueue() {
		if (this.isProcessing || this.queue.length === 0) return;
		this.isProcessing = true;
		const nextMatch = this.queue.shift();
		if(nextMatch)
		{
			try{
				nextMatch.putOnBlockchain();
			}
			catch(e)
			{
				console.error("Error from BlockchainQueue:", e);
			}
		}
		this.isProcessing = false;
		this.processQueue();
	}
}
