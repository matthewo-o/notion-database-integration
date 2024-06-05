export enum NotionObject {
	Database = 'database',
}

// https://developers.notion.com/reference/property,object

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

export interface INotionDatabaseProperty {
	id: string
	name: string
	type: NotionProperty
}

export interface ICheckboxProperty extends INotionDatabaseProperty {
	type: NotionProperty.Checkbox
}
export interface ICreatedAtProperty extends INotionDatabaseProperty {
	type: NotionProperty.CreatedAt
}
export interface IDateProperty extends INotionDatabaseProperty {
	type: NotionProperty.Date
}
export interface IEmailProperty extends INotionDatabaseProperty {
	type: NotionProperty.Email
}
export interface IFileProperty extends INotionDatabaseProperty {
	//Update 2024-6-5 Notion API not support upload file
	type: NotionProperty.Files
}
export interface ILastEditAtProperty extends INotionDatabaseProperty {
	type: NotionProperty.LastEditedAt
}
export interface ITagProperty extends INotionDatabaseProperty {
	type: NotionProperty.Tag
}
export interface INumberProperty extends INotionDatabaseProperty {
	type: NotionProperty.Number
	number: { format: NotionNumberFormat }
}
export interface ITextProperty extends INotionDatabaseProperty {
	type: NotionProperty.Text
}
export interface ISelectProperty extends INotionDatabaseProperty {
	type: NotionProperty.Select
	select: {
		options: INotionSelectOption[]
	}
}
export interface ITitleProperty extends INotionDatabaseProperty {
	type: NotionProperty.Title
}
export interface IURLProperty extends INotionDatabaseProperty {
	type: NotionProperty.URL
}
