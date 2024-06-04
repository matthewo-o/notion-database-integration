import { ObsidianHttpService } from 'obsidian-service'

export interface INotionApIHeader extends Record<string, string> {
	'Content-Type': string
	Authorization: string
	'Notion-Version': string
}

export class NotionDataBase {
	private headers: INotionApIHeader
	private httpService: ObsidianHttpService
	private databaseSubPath: string

	get databasePathPrefix() {
		return `databases/${this.databaseId}`
	}

	get pagePathPrefix() {
		return `pages/`
	}

	constructor(private notionApi: string, private databaseId: string) {
		this.headers = {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${notionApi}`,
			'Notion-Version': '2022-02-22',
		}
		this.httpService = new ObsidianHttpService('https://api.notion.com/v1/')
		this.httpService.setHeaders(this.headers)
	}

	async fetchDatabaseConfig() {
		return this.httpService.get(this.databasePathPrefix)
	}
}
