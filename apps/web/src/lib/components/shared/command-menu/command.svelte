<script lang="ts">
	import { goto } from '$app/navigation';
	import Icon from '$lib/components/shared/icon.svelte';
	import { db } from '$lib/database/client';
	import { entry as entryTable } from '$lib/database/schema';
	import { getCollections, loadCollection } from '@/api/collection';
	import { moveNote, openNote } from '@/api/notes';
	import { activeFile, collection } from '@/store';
	import { formatTimeAgo, shortcutToString } from '@/utils';
	import * as Command from '@haptic/ui/components/command';
	import { Loader, Twitter } from 'lucide-svelte';
	import { setMode, userPrefersMode } from 'mode-watcher';
	import { onMount } from 'svelte';
	import { mainCommands as commands, createNoteCommands } from './commands';
	import { getAllItems } from './helpers';

	let open = false;
	let search = '';
	let value: string | undefined = undefined;
	let page: string | undefined = undefined;
	let openedWithShortcut = '';
	let fileInput: HTMLInputElement | null = null;
	let loadingCollection: { loading: boolean; progress: number } | undefined = undefined;

	const shortcutKeyMap: Record<string, string | undefined> = {
		'cmd+k': 'default',
		'cmd+j': 'open_note',
		'cmd+shift+m': 'move_note',
		'cmd+shift+t': 'change_theme',
		'cmd+o': 'open_collection',
		'cmd+shift+h': 'help_and_feedback',
		'cmd+shift+l': 'share'
	};

	// If a page is provided, it opens that page, otherwise it closes the menu
	function handlePageState(newPage: string | undefined) {
		if (!newPage) {
			open = false;
			openedWithShortcut = '';
		} else {
			// Add bounce animation for page change
			const dialog = document.querySelector('[data-dialog-content]');

			if (dialog) {
				dialog.animate(
					[
						{ transform: 'scale(1)' },
						{ transform: 'scale(0.98, 0.98)' },
						{ transform: 'scale(1, 1)' }
					],
					{
						duration: 225,
						easing: 'ease'
					}
				);
			}
		}

		page = newPage;
		search = '';
	}

	onMount(() => {
		function handleKeydown(e: KeyboardEvent) {
			const keyPressed = `${e.metaKey || e.ctrlKey ? 'cmd+' : ''}${e.shiftKey ? 'shift+' : ''}${
				e.key
			}`;
			if (
				(e.metaKey || e.ctrlKey || e.shiftKey) &&
				shortcutKeyMap[keyPressed] &&
				(openedWithShortcut === keyPressed || openedWithShortcut === '')
			) {
				e.preventDefault();
				openedWithShortcut = keyPressed;
				page = shortcutKeyMap[keyPressed];
				open = !open;
				if (!open) {
					handlePageState(undefined);
				}
			}
		}
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
		};
	});

	activeFile.subscribe((notePath) => {
		// Remove last note specific commands
		if (commands[0].name !== 'Notes') {
			commands.shift();
		}

		if (notePath) {
			// Add notePath specific commands to the top of the list
			commands.unshift(createNoteCommands(notePath));

			// Set value to first command
			value = commands[0].commands[0].title;
		}
	});

	async function openCollection() {
		if (!files || files.length === 0) {
			return console.error('No files selected');
		}

		// Set loading state
		loadingCollection = { loading: true, progress: 0 };

		// Load collection
		const collectionName = files[0]?.webkitRelativePath.split('/')[0];
		await loadCollection(`/${collectionName}`);

		const processedPaths = new Set<string>();

		for (let i = 0; i < files.length; i++) {
			const file = files[i];
			if (!file) continue;

			const filePath = `/${file.webkitRelativePath}`;
			const pathParts = file.webkitRelativePath.split('/');
			const fileName = pathParts[pathParts.length - 1];

			// Log progress
			let progress = Math.round(((i + 1) / files.length) * 100);
			loadingCollection = { loading: true, progress };

			// Create folder entries
			let currentPath = '';
			for (let j = 0; j < pathParts.length - 1; j++) {
				currentPath += '/' + pathParts[j];
				if (!processedPaths.has(currentPath)) {
					await createFolderEntry(currentPath, collectionName);
					processedPaths.add(currentPath);
				}
			}

			// Process file
			if (file.name.toLowerCase().endsWith('.md')) {
				try {
					const fileText = await file.text();
					await db.insert(entryTable).values({
						name: fileName,
						path: filePath,
						content: fileText,
						parentPath: currentPath,
						collectionPath: `/${collectionName}`,
						size: file.size,
						isFolder: false
					});
					console.log('Inserted file:', fileName);
				} catch (error) {
					console.error('Error processing file:', fileName, error);
				}
			} else {
				console.warn('Skipping non-Markdown file:', fileName);
			}
		}

		// Reset loading state
		loadingCollection = undefined;

		// Close dialog
		await goto('/notes');
		handlePageState(undefined);
	}

	async function createFolderEntry(path: string, collectionName: string) {
		const pathParts = path.split('/').filter(Boolean);
		const folderName = pathParts[pathParts.length - 1];
		const parentPath = '/' + pathParts.slice(0, -1).join('/');

		try {
			await db.insert(entryTable).values({
				name: folderName,
				path: path,
				content: undefined,
				parentPath: parentPath,
				collectionPath: `/${collectionName}`,
				isFolder: true
			});
			console.log('Created folder entry:', path);
		} catch (error) {
			console.error('Error creating folder entry:', path, error);
		}
	}

	let files: FileList | undefined;
	$: if (files) {
		openCollection();
	}
</script>

<Command.Dialog
	bind:open
	bind:value
	loop
	onKeydown={(e) => {
		if (e.key === 'Escape') {
			handlePageState(undefined);
			openedWithShortcut = '';
		} else if (
			e.key === 'Backspace' &&
			!search &&
			page !== 'default' &&
			openedWithShortcut === 'cmd+k'
		) {
			handlePageState('default');
		}
	}}
>
	<Command.Input bind:value={search} placeholder="Search or jump to..." />
	<Command.List>
		{#if !loadingCollection}
			<Command.Empty class="text-foreground/60 font-light">No commands found</Command.Empty>
		{/if}
		{#if page === 'default'}
			{#each commands as group}
				<Command.Group heading={group.name}>
					{#each group.commands as command}
						<Command.Item
							class="[&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
							value={command.title}
							onSelect={() => {
								const page = command.onSelect?.();
								if (typeof page === 'undefined') {
									handlePageState(undefined);
								} else {
									handlePageState(page);
								}
							}}
						>
							<div class="flex w-full items-center justify-between">
								<div class="flex items-center gap-1.5">
									{#if command.icon}
										<Icon name={command.icon} />
									{/if}
									<span class="text-foreground/80 group:hover:text-foreground/100"></span>
									{command.title}
								</div>
								{#if command.shortcut}
									<span class="ml-auto text-xs tracking-widest text-muted-foreground h-full"
										>{shortcutToString(command.shortcut)}
									</span>
								{/if}
							</div>
						</Command.Item>
					{/each}
				</Command.Group>
			{/each}
		{:else if page === 'move_note'}
			<Command.Group heading="Move note to...">
				{#await getAllItems(true)}
					<!-- TODO: Make this a loading spinner -->
					<Command.Loading class="text-foreground/90">Loading folders...</Command.Loading>
				{:then folders}
					{#each folders as folder}
						{#if folder.path + `/${$activeFile?.split('/').pop()}` !== $activeFile}
							<Command.Item
								class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
								value={folder.path}
								onSelect={() => {
									moveNote($activeFile || '', folder.path);
									handlePageState(undefined);
								}}
							>
								<Icon name="folder" />
								{folder.name.slice(1).replaceAll('/', ' > ')}
							</Command.Item>
						{/if}
					{/each}
				{:catch error}
					<Command.Item class="text-foreground/90"
						>Error loading folders: {error.message}</Command.Item
					>
				{/await}
			</Command.Group>
		{:else if page === 'open_note'}
			<Command.Group heading="Open note...">
				{#await getAllItems()}
					<Command.Loading class="text-foreground/90">Loading notes...</Command.Loading>
				{:then notes}
					{#each notes as note}
						<Command.Item
							class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
							value={note.path}
							onSelect={() => {
								openNote(note.path);
								handlePageState(undefined);
							}}
						>
							<Icon name="note" />
							{note.name.slice(1).replaceAll('/', ' > ')}
						</Command.Item>
					{/each}
				{:catch error}
					<Command.Item class="text-foreground/90"
						>Error loading notes: {error.message}</Command.Item
					>
				{/await}
			</Command.Group>
		{:else if page === 'change_theme'}
			<Command.Group heading="Change theme...">
				{#if $userPrefersMode !== 'light'}
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="light"
						onSelect={() => {
							setMode('light');
							handlePageState(undefined);
						}}
					>
						<Icon name="sun" />
						Light
					</Command.Item>
				{/if}
				{#if $userPrefersMode !== 'dark'}
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="dark"
						onSelect={() => {
							setMode('dark');
							handlePageState(undefined);
						}}
					>
						<Icon name="moon" />
						Dark
					</Command.Item>
				{/if}
				{#if $userPrefersMode !== 'system'}
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="system"
						onSelect={() => {
							setMode('system');
							handlePageState(undefined);
						}}
					>
						<Icon name="monitor" />
						System
					</Command.Item>
				{/if}
			</Command.Group>
		{:else if page === 'open_collection'}
			{#if loadingCollection}
				<Command.Empty class="text-foreground/60 font-light">
					<div class="flex flex-col items-center gap-1.5">
						<Loader class="w-3.5 h-3.5 animate-spin text-muted-foreground" />
						<div class="flex flex-col gap-0.5">
							Loading collection... ({loadingCollection.progress}%)
							<span class="text-xs text-muted-foreground"
								>Hint: You can close this window and continue working.</span
							>
						</div>
					</div>
				</Command.Empty>
			{:else}
				<Command.Group heading="Open collection">
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						onSelect={async () => {
							fileInput?.click();
						}}
					>
						<Icon name="folderPlus" />
						<!-- Accept folders only -->
						<input
							type="file"
							bind:files
							bind:this={fileInput}
							class="hidden"
							webkitdirectory
							directory
							multiple
						/>
						Open new collection
					</Command.Item>
				</Command.Group>
				{#await getCollections()}
					<Command.Loading class="text-foreground/90">Recent collections</Command.Loading>
				{:then collections}
					{#if collections.filter((c) => c.path !== $collection).length > 0}
						<Command.Group heading="Browse recent collections">
							{#each collections
								.filter((c) => c.path !== $collection)
								.sort((a, b) => +new Date(b.lastOpened) - +new Date(a.lastOpened)) as collection}
								<Command.Item
									class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
									value={collection.path}
									onSelect={async () => {
										await goto('/notes');
										loadCollection(collection.path);
										handlePageState(undefined);
									}}
								>
									<div class="flex w-full items-center justify-between">
										<div class="flex items-center gap-1.5">
											<Icon name="folder" />
											<span class="text-foreground/80 group:hover:text-foreground/100"></span>
											{collection.name}
										</div>
										<span class="ml-auto text-xs text-muted-foreground h-full"
											>{formatTimeAgo(new Date(collection.lastOpened))}
										</span>
									</div>
								</Command.Item>
							{/each}
						</Command.Group>
					{/if}
				{:catch error}
					<Command.Group heading="Browse recent collections">
						<Command.Item class="text-foreground/90"
							>Error loading collections: {error.message}</Command.Item
						>
					</Command.Group>
				{/await}
			{/if}
		{:else if page === 'help_and_feedback'}
			<Command.Group heading="Help & Support">
				<a href="https://go.haptic.md/sponsor" target="_blank" rel="noopener noreferrer">
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="sponsor"
						onSelect={() => {
							handlePageState(undefined);
						}}
					>
						<Icon name="heart" />
						Sponsor Haptic
					</Command.Item>
				</a>
				<a href="https://go.haptic.md/help" target="_blank" rel="noopener noreferrer">
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="help"
						onSelect={() => {
							handlePageState(undefined);
						}}
					>
						<Icon name="lifebouy" />
						Get help
					</Command.Item>
				</a>
				<a href="https://go.haptic.md/feedback" target="_blank" rel="noopener noreferrer">
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
						value="feedback"
						onSelect={() => {
							handlePageState(undefined);
						}}
					>
						<Icon name="commentSquareText" />
						Leave feedback
					</Command.Item>
				</a>
			</Command.Group>
		{:else if page === 'share'}
			<Command.Group heading="Share">
				<Command.Item
					class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:text-foreground [&>*]:fill-foreground/50 [&>*]:aria-selected:fill-foreground"
					value="copy_link"
					onSelect={() => {
						navigator.clipboard.writeText('https://haptic.md');
						handlePageState(undefined);
					}}
				>
					<Icon name="browserUrl" />
					Copy link
				</Command.Item>
				<a href="https://go.haptic.md/tweet" target="_blank" rel="noopener noreferrer">
					<Command.Item
						class="text-foreground/90 gap-3 [&>*]:text-foreground/90 [&>*]:aria-selected:stroke-foreground [&>*]:stroke-foreground/50 [&>*]:stroke-[2px]"
						value="share_on_twitter"
						onSelect={() => {
							handlePageState(undefined);
						}}
					>
						<Twitter />
						Share on Twitter
					</Command.Item>
				</a>
			</Command.Group>
		{/if}
	</Command.List>
</Command.Dialog>

<style>
	:global([data-cmdk-list]) {
		height: min(300px, var(--cmdk-list-height));
		max-height: 400px;
		margin-bottom: 8px;
		margin-top: 8px;
		overscroll-behavior: contain;
		transition: 100ms ease;
		transition-property: height;
	}
</style>
