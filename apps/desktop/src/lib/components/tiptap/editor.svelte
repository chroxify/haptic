<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { editor, activeFile } from '@/store';
	import StarterKit from '@tiptap/starter-kit';
	import Document from '@tiptap/extension-document';
	import { Typography } from '@tiptap/extension-typography';
	import { Markdown } from 'tiptap-markdown';
	import { saveNote } from '@/api/notes';

	let element: HTMLDivElement;
	let tiptapEditor: Editor;
	let timeout: number;

	onMount(() => {
		tiptapEditor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					document: false,
					hardBreak: false,
					paragraph: {
						HTMLAttributes: {
							class: 'my-0 leading-5'
						}
					}
				}),
				Document.extend({
					content: 'heading block*'
				}),
				Typography,
				Markdown.configure({
					transformPastedText: true
				})
			],
			content: '<p>Hello World! 🌍️ </p>',
			editorProps: {
				attributes: {
					class: 'prose prose-theme mx-auto focus:outline-none min-h-full py-6 select-text'
				}
			},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				tiptapEditor = tiptapEditor;
				editor.set(tiptapEditor);
			},
			onUpdate: async () => {
				// If timeout before 500ms, clear it
				if (timeout) {
					clearTimeout(timeout);
				}

				// Set timeout to update the store
				timeout = setTimeout(() => {
					// Save file
					let content = tiptapEditor.storage.markdown.getMarkdown();

					// Remove the first heading title
					content = content.replace(/^# .*\n/, '');

					saveNote($activeFile!, content).catch((error) => {
						console.error('Error saving note:', error);
					});
				}, 750);
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			tiptapEditor.destroy();
		}
	});
</script>

<div bind:this={element} spellcheck="false" autocorrect="false" class="w-full h-full" />
