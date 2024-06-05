import { isNil } from 'lodash'
import { NotionDatabase, NotionProperty, NotionPageStyleBuilder } from 'notion'
import { addNotionIcon, notionLogoIconkey } from 'notion/icon'
import {
	App,
	Editor,
	MarkdownView,
	Modal,
	Notice,
	Plugin,
	PluginSettingTab,
	Setting,
	Vault,
} from 'obsidian'
import { NotionDatabaseFolder } from 'obsidian-service'

// Remember to rename these classes and interfaces!

interface MyPluginSettings {
	mySetting: string
	notionApi: string
	databaseId: string
	pageTitleColumnName: string
	tagColumns: string[]
}

const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default',
	notionApi: '',
	databaseId: '',
	pageTitleColumnName: '',
	tagColumns: [],
}

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings
	notionDatabase: NotionDatabase
	styleBuilder: NotionPageStyleBuilder
	databaseFolder: NotionDatabaseFolder

	async onload() {
		this.initPlugin()
		await this.loadSettings()

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			notionLogoIconkey,
			'Fetch Notion Database',
			async (evt: MouseEvent) => {
				// Called when the user clicks the icon.
				new Notice('Fetching notion database')
				await this.setupDatabaseFolder(this.app.vault)
				await this.databaseFolder.buildPropertiesFile()
			},
		)
		// Perform additional things with the ribbon
		ribbonIconEl.addClass('my-plugin-ribbon-class')

		// This adds a status bar item to the bottom of the app. Does not work on mobile apps.
		const statusBarItemEl = this.addStatusBarItem()
		statusBarItemEl.setText('Status Bar Text')

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: 'open-sample-modal-simple',
			name: 'Open sample modal (simple)',
			callback: () => {
				new SampleModal(
					this.app,
					this.notionDatabase,
					this.styleBuilder,
				).open()
			},
		})
		// This adds an editor command that can perform some operation on the current editor instance
		this.addCommand({
			id: 'sample-editor-command',
			name: 'Sample editor command',
			editorCallback: (editor: Editor, view: MarkdownView) => {
				console.log(editor.getSelection())
				editor.replaceSelection('Sample Editor Command')
			},
		})
		// This adds a complex command that can check whether the current state of the app allows execution of the command
		this.addCommand({
			id: 'open-sample-modal-complex',
			name: 'Open sample modal (complex)',
			checkCallback: (checking: boolean) => {
				// Conditions to check
				const markdownView =
					this.app.workspace.getActiveViewOfType(MarkdownView)
				if (markdownView) {
					// If checking is true, we're simply "checking" if the command can be run.
					// If checking is false, then we want to actually perform the operation.
					if (!checking) {
						new SampleModal(
							this.app,
							this.notionDatabase,
							this.styleBuilder,
						).open()
					}

					// This command will only show up in Command Palette when the check function returns true
					return true
				}
			},
		})

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new SampleSettingTab(this.app, this))

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt)
		})

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(
			window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000),
		)
	}

	initPlugin() {
		this.notionDatabase = new NotionDatabase('2022-02-22')
		this.styleBuilder = new NotionPageStyleBuilder()
		addNotionIcon()
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData(),
		)
		this.notionDatabase.setup(this.settings)
	}

	async saveSettings() {
		await this.saveData(this.settings)
		this.notionDatabase.setup(this.settings)
	}

	async setupDatabaseFolder(vault: Vault) {
		await this.notionDatabase.fetchDatabaseInfo()
		const label = this.notionDatabase.label
		let folder = vault.getFolderByPath(label)
		if (isNil(folder)) {
			folder = await vault.createFolder(label)
			new Notice(`New Folder ${label} was created`)
		}
		this.databaseFolder = new NotionDatabaseFolder(
			folder,
			this.notionDatabase,
			this.settings.pageTitleColumnName,
			this.settings.tagColumns,
		)
		await this.databaseFolder.buildData()
		new Notice(`Fetch Notion Success`)
	}
}

class SampleModal extends Modal {
	constructor(
		app: App,
		private database: NotionDatabase,
		private styleBuilder: NotionPageStyleBuilder,
	) {
		super(app)
	}

	async onOpen() {
		const { contentEl } = this
		await this.database.fetchDatabaseInfo()
		const tagProperty = this.database.tryGetPropertyAsType(
			'Tags',
			NotionProperty.Tag,
		)
		var tags = isNil(tagProperty)
			? ['Test A', 'Test B']
			: tagProperty.multi_select.options.map((option) => option.name)

		contentEl.setText(this.styleBuilder.displayTags(tags))
	}

	onClose() {
		const { contentEl } = this
		contentEl.empty()
	}
}

class SampleSettingTab extends PluginSettingTab {
	plugin: MyPlugin

	constructor(app: App, plugin: MyPlugin) {
		super(app, plugin)
		this.plugin = plugin
	}

	display(): void {
		const { containerEl } = this

		containerEl.empty()

		new Setting(containerEl)
			.setName('Notion API')
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder('Enter your Notion API token')
					.setValue(this.plugin.settings.notionApi)
					.onChange(async (value) => {
						this.plugin.settings.notionApi = value
						await this.plugin.saveSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Database ID')
			.setDesc("It's a secret")
			.addText((text) =>
				text
					.setPlaceholder('Enter your Database ID')
					.setValue(this.plugin.settings.databaseId)
					.onChange(async (value) => {
						this.plugin.settings.databaseId = value
						await this.plugin.saveSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Data Page Title Column')
			.setDesc('It will become your page title of each data')
			.addText((text) =>
				text
					.setPlaceholder('Enter Title column name')
					.setValue(this.plugin.settings.pageTitleColumnName)
					.onChange(async (value) => {
						this.plugin.settings.pageTitleColumnName = value
						await this.plugin.saveSettings()
					}),
			)

		new Setting(containerEl)
			.setName('Tags Columns')
			.setDesc('Group all columns value as tag, seperate column with [,]')
			.addText((text) =>
				text
					.setPlaceholder('Enter column names')
					.setValue(this.plugin.settings.tagColumns.join(','))
					.onChange(async (value) => {
						this.plugin.settings.tagColumns = value.split(',')
						await this.plugin.saveSettings()
					}),
			)
	}
}
