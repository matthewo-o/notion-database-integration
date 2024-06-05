import { compact, isNil, keyBy } from 'lodash'
import {
	IPageData,
	ITextPageProperty,
	ITitlePageProperty,
	NotionDatabase,
	NotionDatabaseProperty,
	NotionPageProperty,
	NotionProperty,
} from 'notion'
import { Notice, TFolder, Vault } from 'obsidian'
import { pageAttributes } from './tools'

export class NotionDatabaseFolder {
	private static Property = 'Property'
	private static DataFolder = 'Data'
	private vault: Vault

	get dataFolder() {
		return `${this.folder.path}/${NotionDatabaseFolder.DataFolder}`
	}

	constructor(
		private folder: TFolder,
		private database: NotionDatabase,
		private titleColumn: string,
		private tagColumns: string[],
	) {
		this.vault = folder.vault
	}

	async buildPropertiesFile() {
		const filePath = `${this.folder.path}/${NotionDatabaseFolder.Property}.md`
		const file = this.vault.getFileByPath(filePath)
		const properties = NotionDatabaseFolder.buildPropertyPage(
			this.database.properties,
		)
		if (isNil(file)) {
			await this.vault.create(filePath, properties)
			new Notice(`Property File Created`)
		} else {
			await this.vault.modify(file, properties)
			new Notice(`Property File Updated`)
		}
	}

	async buildData() {
		let folder = this.vault.getFolderByPath(this.dataFolder)
		if (isNil(folder)) {
			folder = await this.vault.createFolder(this.dataFolder)
			new Notice(
				`New Folder ${NotionDatabaseFolder.DataFolder} was created`,
			)
		}
		const fileList = this.vault.getMarkdownFiles()
		const fileMap = keyBy(fileList, (file) => file.name)
		const data = await this.database.fetchAllData()

		await Promise.all(
			data.map((page) => {
				let title = this.getPageTitle(page)
				let filename = `${title}.md`
				let file = fileMap[filename]
				let content = this.buildDataPage(page)
				return isNil(file)
					? this.vault.create(`${folder.path}/${filename}`, content)
					: this.vault.modify(file, content)
			}),
		)
	}

	private getPageTitle(page: IPageData) {
		if (isNil(this.titleColumn)) return page.id
		let column = page.properties[this.titleColumn]
		if (isNil(column)) return page.id
		switch (column.type) {
			case NotionProperty.Text:
				let textProperty = column as ITextPageProperty
				return textProperty.rich_text.length > 0
					? textProperty.rich_text[0].plain_text
					: page.id
			case NotionProperty.Title:
				let titleProperty = column as ITitlePageProperty
				return titleProperty.title.length > 0
					? titleProperty.title[0].plain_text
					: page.id
		}
		return page.id
	}

	private static buildPropertyPage(
		properties: Record<string, NotionDatabaseProperty>,
	): string {
		const attributes = Object.keys(properties).map((property) => {
			var info = properties[property]
			return `${info.name} : ${info.type}`
		})

		return `---\n${attributes.join('\n')}\n---`
	}

	private buildDataPage(page: IPageData) {
		const idAttributes = `ID : ${page.id}`
		const createdAt = `Created At : ${page.created_time}`
		const lastUpdatedAt = `Last Updated At : ${page.last_edited_time}`
		const url = `URL : ${page.url}`
		const tags = compact(
			this.tagColumns.flatMap((column) => {
				const property = page.properties[column]
				if (isNil(property)) return null
				return this.transformPropertyAsTags(property)
			}),
		)
		const tagTitle = `Tags : ${tags}`
		const attributes = Object.keys(page.properties).map((property) => {
			var info = page.properties[property]
			return `${property} : ${info.type}`
		})
		return pageAttributes([
			idAttributes,
			tagTitle,
			...attributes,
			createdAt,
			lastUpdatedAt,
			url,
		])
	}

	transformPropertyAsTags(property: NotionPageProperty): string[] {
		switch (property.type) {
			case NotionProperty.Tag:
				return property.multi_select.map((option) => option.name)
			case NotionProperty.Text:
				return property.rich_text.map((text) => text.plain_text)
			case NotionProperty.Title:
				return property.title.map((title) => title.plain_text)
			default:
				return []
		}
	}
}
