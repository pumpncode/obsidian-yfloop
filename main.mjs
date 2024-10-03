import { Plugin } from "obsidian";

const DEFAULT_SETTINGS = {};

/** @extends Plugin */
export default class YfloopPlugin extends Plugin {
    settings;
    /**
     * @returns {Promise<void>}
     */
    async onload() {
        await this.loadSettings();

		const footnotes = new Set();

		this.registerMarkdownPostProcessor((element, context) => {
			const footnoteRefs = element.findAll(".footnote-ref");

			for (const footnoteRef of footnoteRefs) {
				const child = footnoteRef.children[0];
				const fixedLabel = child.getAttribute("data-footref");
				child.textContent = `[${fixedLabel}]`;

				const footnoteId = child.getAttribute("href")
					?.replace(/^#.*?-/, "");

					footnotes.add([footnoteId, fixedLabel]);
			}
		});

		this.registerMarkdownPostProcessor((element, context) => {
			for (const [footnoteId, fixedLabel] of footnotes) {
				const footnote = element.find(`section.footnotes>ol>li[data-footnote-id="fn-${footnoteId}"]`);

				console.log(`section.footnotes>ol>li[data-footnote-id="fn-${footnoteId}"]`);
				console.log(element.findAll(`section.footnotes>ol>li[data-footnote-id="fn-${footnoteId}"]`));
				console.log(footnote);
				if (footnote) {
					const markerLabel = `${fixedLabel}. `
	
					footnote.setAttribute("data-yfloop-marker", markerLabel);
				}


			}
		});
    }
    /**
     * @returns {void}
     */
    onunload() {
    }
    /**
     * @returns {Promise<void>}
     */
    async loadSettings() {
        this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
    }
    /**
     * @returns {Promise<void>}
     */
    async saveSettings() {
        await this.saveData(this.settings);
    }
}
