import { isEmpty } from 'lodash'
import { ObsidianHttpService } from 'obsidian-service'
import { INotionDatabaseProperty, NotionObject, NotionProperty } from './type'

export interface INotionApIHeader extends Record<string, string> {
	Authorization: string
	'Notion-Version': string
}

export interface INotionDatabaseInfo {
	object: NotionObject
	id: string
	created_time: Date
	last_edited_time: Date
	url: string
	properties: Record<string, INotionDatabaseProperty>
}

export class NotionDatabase {
	private headers: INotionApIHeader
	private httpService: ObsidianHttpService
	private notionApi: string
	private databaseId: string

	get databasePathPrefix() {
		return `databases/${this.databaseId}`
	}

	get pagePathPrefix() {
		return `pages/`
	}

	constructor(private notionSupportVersion: string) {
		this.httpService = new ObsidianHttpService('https://api.notion.com/v1')
	}

	setup(params: { notionApi: string; databaseId: string }) {
		const { notionApi, databaseId } = params
		this.notionApi = notionApi
		this.databaseId = databaseId
		this.headers = {
			Authorization: `Bearer ${notionApi}`,
			'Notion-Version': this.notionSupportVersion,
		}
		this.httpService.setHeaders(this.headers)
	}

	private validConfig() {
		if (isEmpty(this.notionApi) || isEmpty(this.databaseId)) {
			throw new Error('Database config not ready')
		}
	}

	async fetchDatabaseInfo() {
		this.validConfig()
		return await this.httpService.get<INotionDatabaseInfo>(
			this.databasePathPrefix,
		)
	}
}
