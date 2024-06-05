import { isEmpty, isNil } from 'lodash'
import { ObsidianHttpService } from 'obsidian-service'
import {
	ICheckboxProperty,
	ICreatedAtProperty,
	IDateProperty,
	IEmailProperty,
	IFileProperty,
	ILastEditAtProperty,
	INumberProperty,
	ISelectProperty,
	ITagProperty,
	ITextProperty,
	ITitleProperty,
	IURLProperty,
	NotionDatabaseProperty,
	NotionObject,
	NotionProperty,
} from './type'

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
	properties: Record<string, NotionDatabaseProperty>
}

export class NotionDatabase {
	private headers: INotionApIHeader
	private httpService: ObsidianHttpService
	private notionApi: string
	private databaseId: string
	private info: INotionDatabaseInfo

	get databasePathPrefix() {
		return `databases/${this.databaseId}`
	}

	get pagePathPrefix() {
		return `pages`
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
		this.info = await this.httpService.get<INotionDatabaseInfo>(
			this.databasePathPrefix,
		)
	}

	tryGetPropertyAsType<Type extends NotionDatabaseProperty['type']>(
		propertyName: string,
		type: Type,
	): Extract<NotionDatabaseProperty, { type: Type }> | undefined {
		const detail = this.info.properties[propertyName]
		if (isNil(detail) || detail.type !== type) return undefined
		return detail as Extract<NotionDatabaseProperty, { type: Type }>
	}
}
