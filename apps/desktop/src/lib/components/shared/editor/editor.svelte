<script lang="ts">
	import { saveNote } from '@/api/notes';
	import { SHORTCUTS } from '@/constants';
	import { activeFile, collectionSettings, editor } from '@/store';
	import { Editor } from '@tiptap/core';
	import CharacterCount from '@tiptap/extension-character-count';
	import Document from '@tiptap/extension-document';
	import { Link } from '@tiptap/extension-link';
	import { TaskItem } from '@tiptap/extension-task-item';
	import { TaskList } from '@tiptap/extension-task-list';
	import { Typography } from '@tiptap/extension-typography';
	import StarterKit from '@tiptap/starter-kit';
	import { onDestroy, onMount } from 'svelte';
	import { get } from 'svelte/store';
	import { Markdown } from 'tiptap-markdown';
	import Shortcut from '../shortcut.svelte';
	import SearchAndReplace from './extensions';

	let element: HTMLDivElement;
	let tiptapEditor: Editor;
	let timeout: NodeJS.Timeout;

	onMount(() => {
		tiptapEditor = new Editor({
			element: element,
			extensions: [
				StarterKit.configure({
					document: false,
					hardBreak: false,
					paragraph: {
						HTMLAttributes: {
							class: 'min-w-[1px] my-1 leading-5'
						}
					}
				}),
				CharacterCount,
				Document,
				SearchAndReplace.configure({
					searchResultClass: 'search-result',
					disableRegex: false
				}),
				Typography,
				TaskList,
				TaskItem.configure({
					HTMLAttributes: {
						class:
							'flex items-start pl-1.5 gap-2 [&>div]:mb-0 [&>label]:mt-0 [&>div]:w-full [&>div>p]:inline-block [&>label]:inline-flex [&>label]:items-center [&>label>input]:rounded-md'
					},
					nested: true
				}),
				Link.configure({
					HTMLAttributes: {
						class:
							'text-primary underline hover:text-primary/80 transition-all cursor-pointer text-base [&>*]:font-normal'
					}
				}),
				Markdown.configure({
					linkify: true,
					transformPastedText: true
				})
			],
			editorProps: {
				attributes: {
					class: 'prose prose-theme mx-auto focus:outline-none min-h-full pb-6 select-text'
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
				timeout = setTimeout(async () => {
					if ($collectionSettings.editor.auto_save) {
						console.log('Saving note...');
						saveNote($activeFile!)
							.then(() => {
								editor.notifySaveEvent();
							})
							.catch((error) => {
								console.error('Error saving note:', error);
							});
					}
				}, $collectionSettings.editor.auto_save_debounce);
			}
		});
	});

	onDestroy(() => {
		if (editor) {
			tiptapEditor.destroy();
		}
	});
</script>

<!-- >96px is required to hide scrollbar in normal size -->
<div
	bind:this={element}
	spellcheck={$collectionSettings.editor.spell_check}
	autocorrect={$collectionSettings.editor.auto_correct.toString()}
	class="w-full h-[calc(100%-97px)] px-8"
>
	<Shortcut options={SHORTCUTS['note:save']} callback={() => saveNote(get(activeFile) ?? '')} />
	<Shortcut
		options={SHORTCUTS['note:copy-path']}
		callback={() => navigator.clipboard.writeText(get(activeFile) ?? '')}
	/>
</div>

<style>
	div :global(ul[data-type='taskList']) {
		list-style: none;
		padding: 0;
		user-select: none;
	}

	div :global(ul[data-type='taskList'] li > label input[type='checkbox']) {
		-webkit-appearance: none;
		appearance: none;
		transition: 120ms all ease-in-out;
		/* background-color: hsl(var(--background) / 1); */
		margin: 0;
		cursor: pointer;
		width: 1.2em;
		height: 1.2em;
		position: relative;
		top: 5px;
		border: 1px solid hsl(var(--border) / 1);
		display: grid;
		place-content: center;

		&:hover {
			background-color: hsl(var(--accent) / 1);
			border: 1px solid hsl(var(--foreground) / 0.6);
		}

		/* &:checked {
			background-color: hsl(var(--primary) / 1);
		} */

		&::before {
			content: '';
			width: 0.65em;
			height: 0.65em;
			transform: scale(0);
			transition: 120ms transform ease-in-out;
			box-shadow: inset 1em 1em;
			transform-origin: center;
			clip-path: polygon(10% 44%, 0 65%, 40% 100%, 100% 10%, 80% 0%, 43% 62%);
		}

		&:checked::before {
			transform: scale(1);
		}
	}

	div :global(ul[data-type='taskList'] li[data-checked='true'] > div > p) {
		color: hsl(var(--foreground) / 0.6);
		text-decoration: line-through;
		text-decoration-thickness: 1px;
	}

	div :global(ul[data-type='taskList'] li > label) {
		margin-right: 0.2rem;
		user-select: none;
	}

	div :global(.search-result) {
		background-color: hsl(var(--muted));
	}

	div :global(.search-result-current) {
		background-color: rgba(248, 160, 30, 0.5);
	}
</style>
