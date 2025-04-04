import { RawData } from "ws";

export class Parser {
	static rawDataToJson(data: RawData): any {
		try {
			const jsonString = data.toString();
			const jsonData = JSON.parse(jsonString);
			return jsonData;
		} catch (error) {
			console.warn("Transcendence error parsing JSON: ", error);
			return null;
		}
	}
}
