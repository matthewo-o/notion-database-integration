import { requestUrl } from 'obsidian'

export class ObsidianHttpService {
	private headers: Record<string, string>
	constructor(private baseUrl: string) {}

	setHeaders(headers: Record<string, string>) {
		this.headers = headers
	}

	async get(subPath: string) {
		return await requestUrl({
			url: `${this.baseUrl}/${subPath}`,
			method: 'GET',
			headers: this.headers,
		})
	}
}
