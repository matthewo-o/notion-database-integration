import { isEmpty, isNil } from 'lodash'
import { ObsidianHttpService } from 'obsidian-service'
import {
	NotionDatabaseProperty,
	NotionObject,
	NotionPageProperty,
	IRichText,
} from './type'

export interface INotionDatabaseInfo {
	object: NotionObject
	id: string
	title: IRichText[]
	created_time: Date
	last_edited_time: Date
	url: string
	properties: Record<string, NotionDatabaseProperty>
}

export interface INotionDatabasePageResult {
	object: NotionObject
	results: IPageData[]
	next_cursor: string | null | undefined
	has_more: boolean
}

export interface IPageData {
	object: NotionObject
	id: string
	created_time: Date
	last_edited_time: Date
	properties: Record<string, NotionPageProperty>
	url: string
}

export class NotionDatabase {
	private httpService: ObsidianHttpService
	private notionApi: string
	private databaseId: string
	private info: INotionDatabaseInfo
	private datas: IPageData[]

	get databasePathPrefix() {
		return `databases/${this.databaseId}`
	}

	get pagePathPrefix() {
		return `pages`
	}

	get label() {
		return isEmpty(this.info.title)
			? this.info.id
			: this.info.title[0].plain_text
	}

	get properties() {
		return this.info.properties
	}

	get baseHeader() {
		return {
			Authorization: `Bearer ${this.notionApi}`,
			'Notion-Version': this.notionSupportVersion,
		}
	}

	get postHeader() {
		return {
			...this.baseHeader,
			'Content-Type': 'application/json',
		}
	}

	constructor(private notionSupportVersion: string) {
		this.httpService = new ObsidianHttpService('https://api.notion.com/v1')
	}

	setup(params: { notionApi: string; databaseId: string }) {
		const { notionApi, databaseId } = params
		this.notionApi = notionApi
		this.databaseId = databaseId
	}

	private validConfig() {
		if (isEmpty(this.notionApi) || isEmpty(this.databaseId)) {
			throw new Error('Database config not ready')
		}
	}

	async fetchDatabaseInfo() {
		this.validConfig()
		this.httpService.setHeaders(this.baseHeader)
		this.info = await this.httpService.get<INotionDatabaseInfo>(
			this.databasePathPrefix,
		)
	}

	async fetchAllData() {
		this.validConfig()
		this.datas = []
		this.httpService.setHeaders(this.postHeader)
		let pageResult: INotionDatabasePageResult = {
			object: NotionObject.List,
			results: [],
			next_cursor: undefined,
			has_more: false,
		}
		do {
			let body = isNil(pageResult.next_cursor)
				? {}
				: { start_cursor: pageResult.next_cursor }
			console.log('Request Body : ', body)
			pageResult = await this.httpService.post<INotionDatabasePageResult>(
				`${this.databasePathPrefix}/query`,
				body,
			)
			console.log('Page Result : ', pageResult)
			this.datas.push(...pageResult.results)
		} while (pageResult.has_more)
		return this.datas
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
