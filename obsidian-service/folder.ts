import { isNil, keyBy } from 'lodash'
import {
	IPageData,
	ITextPageProperty,
	ITitlePageProperty,
	NotionDatabase,
	NotionDatabaseProperty,
	NotionProperty,
} from 'notion'
import { Notice, TFolder, Vault } from 'obsidian'

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
				let file = fileMap[title]
				let content = NotionDatabaseFolder.buildDataPage(page)
				return isNil(file)
					? this.vault.create(`${folder.path}/${title}.md`, content)
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

	private static buildDataPage(page: IPageData) {
		const idAttributes = `ID : ${page.id}`
		const createdAt = `Created At : ${page.created_time}`
		const lastUpdatedAt = `Last Updated At : ${page.last_edited_time}`
		const url = `URL : ${page.url}`
		const attributes = Object.keys(page.properties).map((property) => {
			var info = page.properties[property]
			return `${property} : ${info.type}`
		})
		return `---\n${idAttributes}\n${attributes.join(
			'\n',
		)}\n${createdAt}\n${lastUpdatedAt}\n${url}\n---`
	}
}
