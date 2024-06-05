export function pageAttributes(column: string[]) {
	return `---\n${column.join('\n')}\n---`
}
