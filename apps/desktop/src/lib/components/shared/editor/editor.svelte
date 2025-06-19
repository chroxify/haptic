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

	import { Mark, mergeAttributes } from '@tiptap/core';
	import { Plugin, PluginKey } from '@tiptap/pm/state';

	import { getAllItems } from '@/components/shared/command-menu/helpers';
	import { openNote } from '@/api/notes';

	async function getAvailableNotes(
		searchTerm: string = ''
	): Promise<{ name: string; path: string }[]> {
		try {
			// Get all notes using the existing getAllItems function
			const allNotes = await getAllItems(false); // false = get notes, not folders

			console.log('All notes from getAllItems:', allNotes); // Debug log

			// Map to objects containing both display name and full path
			const noteData = allNotes.map((note) => {
				// Remove .md extension and any leading slashes
				let name = note.name.replace(/\.md$/, '');
				if (name.startsWith('/')) {
					name = name.substring(1);
				}

				return {
					name: name, // Clean display name
					path: note.path // Full filesystem path
				};
			});

			// Filter based on search term if provided
			if (searchTerm) {
				const lowerSearchTerm = searchTerm.toLowerCase();
				return noteData.filter((item) => item.name.toLowerCase().includes(lowerSearchTerm));
			}

			return noteData;
		} catch (error) {
			console.error('Error getting available notes:', error);
			return [];
		}
	}

	// Custom Wikilink mark
	const WikiLink = Mark.create({
		name: 'wikilink',

		addAttributes() {
			return {
				'data-note': {
					default: null
				},
				'data-type': {
					default: 'wikilink'
				}
			};
		},

		parseHTML() {
			return [
				{
					tag: 'a[data-type="wikilink"]'
				}
			];
		},

		renderHTML({ HTMLAttributes }) {
			return [
				'a',
				mergeAttributes(HTMLAttributes, {
					'data-type': 'wikilink',
					class: 'wiki-link',
					'data-note': HTMLAttributes['data-note']
				}),
				0
			];
		},

		addProseMirrorPlugins() {
			return [
				new Plugin({
					key: new PluginKey('wikilink'),
					props: {
						handleTextInput: (view, from, to, text) => {
							const { state } = view;
							const { tr } = state;

							// Get text before cursor
							const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, '\n', ' ');
							const fullText = textBefore + text;

							// Check for autocomplete trigger
							const autocompleteMatch = fullText.match(/\[\[([^\]]*)$/);
							if (autocompleteMatch) {
								const searchTerm = autocompleteMatch[1];

								// Show autocomplete if we have [[ followed by text
								if (text !== ']') {
									// Get cursor position for autocomplete placement
									const coords = view.coordsAtPos(from);

									// Get suggestions asynchronously
									getAvailableNotes(searchTerm).then((suggestions) => {
										if (suggestions.length > 0) {
											showAutocomplete(suggestions, {
												x: coords.left,
												y: coords.bottom
											});
										}
									});
								}
							} else {
								// Hide autocomplete if we're not in wikilink context
								hideAutocomplete();
							}

							// Check for completed wikilink pattern
							const completedMatch = fullText.match(/\[\[([^\]]+)\]\]$/);
							if (completedMatch) {
								hideAutocomplete();

								const linkText = completedMatch[1];
								const matchStart = from - completedMatch[0].length + text.length;
								const matchEnd = from + text.length;

								// For now, just create the text without the mark
								tr.delete(matchStart, matchEnd);
								tr.insertText(linkText, matchStart);

								// Store position for async path resolution
								const tempMark = {
									start: matchStart,
									end: matchStart + linkText.length,
									text: linkText
								};

								// Dispatch the text change first
								view.dispatch(tr);

								// Then resolve the path and add the mark
								getAllItems(false).then((allNotes) => {
									const matchedNote = allNotes.find(
										(note) => note.name.replace(/\.md$/, '') === linkText
									);

									if (matchedNote && tiptapEditor) {
										// Create a new transaction with the mark
										const markTr = tiptapEditor.state.tr;
										const mark = this.type.create({
											'data-note': matchedNote.path // FULL PATH
										});

										markTr.addMark(tempMark.start, tempMark.end, mark);
										tiptapEditor.view.dispatch(markTr);
									}
								});

								return true;
							}

							return false;
						},

						handleKeyDown: (view, event) => {
							if (!autocompleteActive) return false;

							switch (event.key) {
								case 'ArrowDown':
									event.preventDefault();
									selectedSuggestionIndex = Math.min(
										selectedSuggestionIndex + 1,
										currentSuggestions.length - 1
									);
									updateSelection();
									return true;

								case 'ArrowUp':
									event.preventDefault();
									selectedSuggestionIndex = Math.max(selectedSuggestionIndex - 1, 0);
									updateSelection();
									return true;

								case 'Enter':
								case 'Tab':
									event.preventDefault();
									if (selectedSuggestionIndex >= 0) {
										insertSuggestion(currentSuggestions[selectedSuggestionIndex]);
									}
									return true;

								case 'Escape':
									hideAutocomplete();
									return true;
							}

							return false;
						}
					}
				})
			];
		}
	});

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
				WikiLink,
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

		if (element) {
			element.addEventListener('click', handleWikilinkClick, true); // Use capture phase
		}
	});

	// Add this function after onMount and before onDestroy
	function handleWikilinkClick(event: MouseEvent) {
		const target = event.target as HTMLElement;

		if (target.matches('a[data-type="wikilink"]') || target.classList.contains('wiki-link')) {
			event.preventDefault();
			event.stopPropagation();

			// Get the FULL PATH from data-note
			const fullPath = target.getAttribute('data-note');

			console.log('Wikilink clicked, full path:', fullPath);

			if (fullPath) {
				// Always use the full path
				openNote(fullPath, true);
			} else {
				console.error('No path found on wikilink!');
			}

			return false;
		}
	}

	onDestroy(() => {
		if (tiptapEditor) {
			tiptapEditor.destroy();
		}
		if (element) {
			element.removeEventListener('click', handleWikilinkClick, true);
		}
		// Clean up autocomplete
		hideAutocomplete();
		if (autocompleteElement) {
			document.body.removeChild(autocompleteElement);
			autocompleteElement = null;
		}
	});

	// Autocomplete functionality
	let autocompleteElement: HTMLDivElement | null = null;
	let currentSuggestions: { name: string; path: string }[] = [];

	let selectedSuggestionIndex = -1;
	let autocompleteActive = false;

	function createAutocompleteElement() {
		if (autocompleteElement) return autocompleteElement;

		autocompleteElement = document.createElement('div');
		autocompleteElement.className = 'wikilink-autocomplete';
		autocompleteElement.style.cssText = `
			position: absolute;
			background: hsl(var(--background));
			border: 1px solid hsl(var(--border));
			border-radius: 6px;
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
			max-height: 200px;
			overflow-y: auto;
			z-index: 1000;
			display: none;
			min-width: 200px;
		`;

		document.body.appendChild(autocompleteElement);
		return autocompleteElement;
	}

	function showAutocomplete(
		suggestions: { name: string; path: string }[],
		position: { x: number; y: number }
	) {
		const element = createAutocompleteElement();
		currentSuggestions = suggestions;
		selectedSuggestionIndex = -1;

		element.innerHTML = suggestions
			.map(
				(suggestion, index) =>
					`<div class="autocomplete-item" data-index="${index}" data-path="${suggestion.path}" style="
				padding: 8px 12px;
				cursor: pointer;
				border-bottom: 1px solid hsl(var(--border));
				transition: background-color 0.2s;
			">${suggestion.name}</div>`
			)
			.join('');

		// Add click handlers
		element.querySelectorAll('.autocomplete-item').forEach((item, index) => {
			item.addEventListener('mouseenter', () => {
				selectedSuggestionIndex = index;
				updateSelection();
			});

			item.addEventListener('click', () => {
				insertSuggestion(suggestions[index]);
			});
		});

		element.style.left = `${position.x}px`;
		element.style.top = `${position.y + 20}px`;
		element.style.display = 'block';
		autocompleteActive = true;

		updateSelection();
	}

	function hideAutocomplete() {
		if (autocompleteElement) {
			autocompleteElement.style.display = 'none';
		}
		autocompleteActive = false;
		selectedSuggestionIndex = -1;
	}

	function updateSelection() {
		if (!autocompleteElement) return;

		const items = autocompleteElement.querySelectorAll('.autocomplete-item');
		items.forEach((item, index) => {
			if (index === selectedSuggestionIndex) {
				(item as HTMLElement).style.backgroundColor = 'hsl(var(--accent))';
			} else {
				(item as HTMLElement).style.backgroundColor = 'transparent';
			}
		});
	}

	function insertSuggestion(suggestion: { name: string; path: string }) {
		if (!tiptapEditor) return;

		const { state } = tiptapEditor;
		const { selection } = state;
		const { from } = selection;

		// Find the [[ before the cursor
		const textBefore = state.doc.textBetween(Math.max(0, from - 50), from, '\n', ' ');
		const match = textBefore.match(/\[\[([^\]]*)$/);

		if (match) {
			const matchStart = from - match[0].length;
			const tr = state.tr;

			// Delete the partial wikilink
			tr.delete(matchStart, from);

			// Insert the complete wikilink text
			const linkText = suggestion.name;
			tr.insertText(linkText, matchStart);

			// Add the wikilink mark with the FULL PATH
			const mark = tiptapEditor.schema.marks.wikilink.create({
				'data-note': suggestion.path // This is the full path!
			});
			tr.addMark(matchStart, matchStart + linkText.length, mark);

			// Move cursor after the link
			tr.setSelection(state.selection.constructor.create(tr.doc, matchStart + linkText.length));

			tiptapEditor.view.dispatch(tr);
		}

		hideAutocomplete();
	}
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
	/* Add these styles to your existing <style> section */
	div :global(.wiki-link) {
		color: hsl(var(--primary));
		text-decoration: none;
		border-bottom: 1px dotted hsl(var(--primary));
		cursor: pointer;
		transition: all 0.2s ease;
	}

	div :global(.wiki-link:hover) {
		background-color: hsl(var(--accent));
		border-bottom-style: solid;
	}

	div :global(.wiki-link-new) {
		color: hsl(var(--destructive));
		text-decoration: none;
		border-bottom: 1px dotted hsl(var(--destructive));
		cursor: pointer;
	}

	div :global(.wiki-link-new:hover) {
		background-color: hsl(var(--destructive) / 0.1);
		border-bottom-style: solid;
	}
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
