export enum NotionObject {
	Database = 'database',
	List = 'list',
	Page = 'page',
}

// https://developers.notion.com/reference/property,object

export enum BlockType {
	Text = 'text',
	Mention = 'mention',
	Equation = 'equation',
}

export interface IRichText {
	type: BlockType
	plain_text: string
}

export enum NotionNumberFormat {
	argentine_peso,
	baht,
	australian_dollar,
	canadian_dollar,
	chilean_peso,
	colombian_peso,
	danish_krone,
	dirham,
	dollar,
	euro,
	forint,
	franc,
	hong_kong_dollar,
	koruna,
	krona,
	leu,
	lira,
	mexican_peso,
	new_taiwan_dollar,
	new_zealand_dollar,
	norwegian_krone,
	number,
	number_with_commas,
	percent,
	philippine_peso,
	pound,
	peruvian_sol,
	rand,
	real,
	ringgit,
	riyal,
	ruble,
	rupee,
	rupiah,
	shekel,
	singapore_dollar,
	uruguayan_peso,
	yen,
	yuan,
	won,
	zloty,
}

export interface INotionSelectOption {
	id: string
	name: string
	color: string
}

export enum NotionProperty {
	Undefined = 'undefined',
	Checkbox = 'checkbox',
	Number = 'number',
	Text = 'rich_text',
	Date = 'date',
	Tag = 'multi_select',
	Files = 'Files',
	Select = 'select',
	Title = 'title',
	CreatedAt = 'created_time',
	LastEditedAt = 'last_edited_time',
	URL = 'url',
	Email = 'email',
}
//#region Database Propery
export type NotionDatabaseProperty =
	| ICheckboxDatabaseProperty
	| ICreatedAtDatabaseProperty
	| IDateDatabaseProperty
	| IEmailDatabaseProperty
	| IFileDatabaseProperty
	| ILastEditAtDatabaseProperty
	| ITagDatabaseProperty
	| INumberDatabaseProperty
	| ITextDatabaseProperty
	| ISelectDatabaseProperty
	| ITitleDatabaseProperty
	| IURLDatabaseProperty

export interface INotionDatabaseProperty {
	id: string
	name: string
	type: NotionProperty
}

export interface ICheckboxDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Checkbox
}
export interface ICreatedAtDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.CreatedAt
}
export interface IDateDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Date
}
export interface IEmailDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Email
}
export interface IFileDatabaseProperty extends INotionDatabaseProperty {
	//Update 2024-6-5 Notion API not support upload file
	type: NotionProperty.Files
}
export interface ILastEditAtDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.LastEditedAt
}
export interface ITagDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Tag
	multi_select: {
		options: INotionSelectOption[]
	}
}
export interface INumberDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Number
	number: { format: NotionNumberFormat }
}
export interface ITextDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Text
}
export interface ISelectDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Select
	select: {
		options: INotionSelectOption[]
	}
}
export interface ITitleDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.Title
}
export interface IURLDatabaseProperty extends INotionDatabaseProperty {
	type: NotionProperty.URL
}
//#endregion

//#region Page Property

export type NotionPageProperty =
	| ITextPageProperty
	| ITitlePageProperty
	| ITagPageProperty

export interface INotionPageProperty {
	id: string
	type: NotionProperty
}

export interface ITextPageProperty extends INotionPageProperty {
	type: NotionProperty.Text
	rich_text: IRichText[]
}

export interface ITitlePageProperty extends INotionPageProperty {
	type: NotionProperty.Title
	title: IRichText[]
}

export interface ITagPageProperty extends INotionPageProperty {
	type: NotionProperty.Tag
	multi_select: INotionSelectOption[]
}

//#endregion
