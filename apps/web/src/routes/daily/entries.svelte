<script lang="ts">
	import { deleteNote, openNote } from '@/api/notes';
	import Icon from '@/components/shared/icon.svelte';
	import Shortcut from '@/components/shared/shortcut.svelte';
	import { SHORTCUTS } from '@/constants';
	import { activeFile } from '@/store';
	import type { FileEntry } from '@/types';
	import { shortcutToString } from '@/utils';
	import Button from '@haptic/ui/components/button/button.svelte';
	import * as ContextMenu from '@haptic/ui/components/context-menu';
	import Label from '@haptic/ui/components/label/label.svelte';
	import { cn } from '@haptic/ui/lib/utils';

	export let entries: FileEntry[];
	let groupedEntries: Record<string, FileEntry[]>;

	function groupEntries(entries: FileEntry[]): Record<string, FileEntry[]> {
		const now = new Date();
		const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const thisWeekStart = new Date(today);
		thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
		const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

		const grouped: Record<string, FileEntry[]> = {
			upcoming: [],
			today: [],
			yesterday: [],
			thisWeek: [],
			thisMonth: [],
			older: []
		};

		entries.forEach((entry) => {
			const fileName = entry.path.split('/').pop() || '';
			const [year, month, day] = fileName.split('.')[0].split('-').map(Number);

			if (isNaN(year) || isNaN(month) || isNaN(day)) {
				// If the file name doesn't match the expected format, put it in 'older'
				grouped.older.push(entry);
				return;
			}

			const entryDate = new Date(year, month - 1, day); // month is 0-indexed in JS Date

			if (entryDate > today) {
				grouped.upcoming.push(entry);
			} else if (entryDate.getTime() === today.getTime()) {
				grouped.today.push(entry);
			} else if (entryDate >= yesterday) {
				grouped.yesterday.push(entry);
			} else if (entryDate >= thisWeekStart) {
				grouped.thisWeek.push(entry);
			} else if (entryDate >= thisMonthStart) {
				grouped.thisMonth.push(entry);
			} else {
				grouped.older.push(entry);
			}
		});

		// Sort function to sort entries by date (newest first)
		const sortByDate = (a: FileEntry, b: FileEntry) => {
			const getDate = (entry: FileEntry) => {
				const [year, month, day] = entry.path
					.split('/')
					.pop()!
					.split('.')[0]
					.split('-')
					.map(Number);
				return new Date(year, month - 1, day).getTime();
			};
			return getDate(b) - getDate(a);
		};

		// Sort each group
		Object.keys(grouped).forEach((key) => {
			grouped[key as keyof typeof grouped].sort(sortByDate);
		});

		return grouped;
	}

	$: groupedEntries = groupEntries(entries);
</script>

{#each Object.entries(groupedEntries) as [groupName, groupEntries]}
	{#if groupEntries.length > 0}
		<div class="w-full text-xs space-y-1">
			<!-- Title -->
			<Label class="text-muted-foreground text-xs pl-1">
				{groupName === 'thisWeek'
					? 'This Week'
					: groupName === 'thisMonth'
						? 'This Month'
						: groupName.charAt(0).toUpperCase() + groupName.slice(1)}
			</Label>

			<!-- Notes -->
			{#each groupEntries as entry}
				<ContextMenu.Root>
					<ContextMenu.Trigger class="w-full" data-path={entry.path}>
						<div class="w-full h-full" role="button" tabindex="0">
							<Button
								size="sm"
								variant="ghost"
								scale="sm"
								class={cn(
									'h-7 w-full transition-all text-secondary-foreground/80 hover:text-foreground flex items-center gap-2 justify-start',
									$activeFile === entry.path && 'bg-accent text-foreground'
								)}
								on:click={() => openNote(entry.path, true)}
							>
								<Shortcut
									options={SHORTCUTS['note:delete']}
									callback={() => deleteNote(entry.path)}
								/>
								<span class="text-xs truncate">{entry.name}</span>
							</Button>
						</div>
					</ContextMenu.Trigger>
					<ContextMenu.Content class="w-44">
						<ContextMenu.Item class="flex items-center gap-2 font-base group">
							<Icon
								name="editPencil"
								class="w-3.5 h-3.5 fill-foreground/70 group-hover:fill-foreground"
							/>
							Rename
							<ContextMenu.Shortcut
								>{shortcutToString(SHORTCUTS['note:rename'])}</ContextMenu.Shortcut
							>
						</ContextMenu.Item>
						<ContextMenu.Separator />
						<ContextMenu.Item
							class="flex text-destructive data-[highlighted]:bg-destructive/20 data-[highlighted]:text-destructive items-center gap-2 font-base group"
							on:click={() => deleteNote(entry.path)}
						>
							<Icon
								name="bin"
								class="w-3.5 h-3.5 fill-destructive/70 group-hover:fill-destructive"
							/>
							Delete
							<ContextMenu.Shortcut class="text-destructive/60"
								>{shortcutToString(SHORTCUTS['note:delete'])}</ContextMenu.Shortcut
							>
						</ContextMenu.Item>
					</ContextMenu.Content>
				</ContextMenu.Root>
			{/each}
		</div>
	{/if}
{/each}
