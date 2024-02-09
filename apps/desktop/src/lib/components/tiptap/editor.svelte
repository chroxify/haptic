<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { Editor } from '@tiptap/core';
	import { editor } from '@/store';
	import StarterKit from '@tiptap/starter-kit';
	import Document from '@tiptap/extension-document';
	import { Typography } from '@tiptap/extension-typography';
	import { Markdown } from 'tiptap-markdown';

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
							class: 'my-0'
						}
					}
				}),
				Document.extend({
					content: 'heading block*'
				}),
				Typography,
				Markdown
			],
			content: '<p>Hello World! 🌍️ </p>',
			editorProps: {
				attributes: {
					class: 'prose dark:prose-invert mx-auto focus:outline-none min-h-full py-6'
				}
			},
			onTransaction: () => {
				// force re-render so `editor.isActive` works as expected
				tiptapEditor = tiptapEditor;
				editor.set(tiptapEditor);
			},
			onUpdate: () => {
				// If timeout before 500ms, clear it
				if (timeout) {
					clearTimeout(timeout);
				}

				// Set timeout to update the store
				timeout = setTimeout(() => {
					console.log('Stopped typing');
					// const title = tiptapEditor.getHTML().split('</h1>')[0].split('<h1>')[1];
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

<div bind:this={element} class="w-full h-full" />
