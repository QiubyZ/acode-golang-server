let test = {
	title: "Organize Imports",
	kind: "source.organizeImports",
	edit: {
		documentChanges: [
			{
				textDocument: {
					version: 1,
					uri: "file:///data/data/com.termux/files/home/Acode/PluginProject/acode-golang-server/ProjectGolang/main.go",
				},
				edits: [
					{
						range: { start: { line: 1, character: 0 }, end: { line: 1, character: 0 } },
						newText: '\nimport (\n\t"bufio"\n\t"fmt"\n\t"net/http"\n)\n',
					},
				],
			},
		],
	},
};

test.edit.documentChanges.forEach((documentChanges) => {
	let uri = documentChanges.textDocument;
	documentChanges.edits.forEach((edits) => {
		console.log(edits.newText);
	});
});
