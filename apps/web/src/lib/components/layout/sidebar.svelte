<script lang="ts">
	import { Button } from '@haptic/ui/components/button';
	import { cn } from '@haptic/ui/lib/utils';
	import Icon from '$lib/components/shared/icon.svelte';
	import Tooltip from '$lib/components/shared/tooltip.svelte';
	import { page } from '$app/stores';
	import SettingsModal from '../settings/settings-modal.svelte';
	import { SHORTCUTS } from '@/constants';

	let selected: 'notes' | 'daily' | 'tasks' = 'notes';

	page.subscribe((value) => {
		const path = value.url.pathname;
		if (path === '/notes' || path === '/daily' || path === '/tasks') {
			selected = path.slice(1) as 'notes' | 'daily' | 'tasks';
		}
	});
</script>

<div
	class="fixed left-0 h-full flex flex-col justify-between items-center w-12 py-12 border-r z-10 bg-background"
>
	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Notes" side="right">
			<a href={'/notes'}>
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all',
						selected === 'notes' && 'fill-foreground bg-accent'
					)}
					scale="md"
					on:click={() => (selected = 'notes')}
				>
					<Icon name="inboxFull" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Daily desk" side="right">
			<a href="/daily">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all',
						selected === 'daily' && 'fill-foreground bg-accent'
					)}
					scale="md"
					on:click={() => (selected = 'daily')}
				>
					<Icon name="calendarEdit" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
		<Tooltip text="Tasks" side="right">
			<a href="tasks">
				<Button
					size="icon"
					variant="ghost"
					class={cn(
						'h-7 w-7 fill-muted-foreground hover:fill-foreground transition-all',
						selected === 'tasks' && 'fill-foreground bg-accent'
					)}
					scale="md"
					on:click={() => (selected = 'tasks')}
				>
					<Icon name="checkSquare" class="w-[18px] h-[18px]" />
				</Button>
			</a>
		</Tooltip>
	</div>

	<div class="flex flex-col items-center gap-2">
		<Tooltip text="Open collection" side="right" shortcut={SHORTCUTS['app:open-collection']}>
			<Button
				size="icon"
				variant="ghost"
				class="h-7 w-7 fill-muted-foreground hover:fill-foreground group relative"
				scale="md"
				on:click={() => {
					// Simulate cmd+o key press
					document.dispatchEvent(new KeyboardEvent('keydown', { key: 'o', metaKey: true }));
				}}
			>
				<Icon name="folder" class="w-[18px] h-[18px] group-hover:hidden" />
				<Icon name="folderOpen" class="w-[18px] h-[18px] hidden group-hover:block" />
			</Button>
		</Tooltip>
		<Tooltip text="Settings" side="right" shortcut={SHORTCUTS['app:settings']}>
			<SettingsModal />
		</Tooltip>
	</div>
</div>
