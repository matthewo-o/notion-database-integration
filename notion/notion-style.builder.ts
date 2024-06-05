import { INotionDatabaseProperty, NotionProperty } from './type'

function defaultTagsDisplay(tags: string[]) {
	return `---
    tags: [${tags}]
    ---`
}

export class NotionPageStyleBuilder {
	private content: INotionDatabaseProperty[]
	constructor(
		private styleMap?: Record<
			NotionProperty,
			(property: INotionDatabaseProperty) => string
		>,
	) {}

	setContent(content: INotionDatabaseProperty[]) {
		this.content = content
	}

	displayTags(tags: string[]) {
		return defaultTagsDisplay(tags)
	}
}
