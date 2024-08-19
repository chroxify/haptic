import { writable } from 'svelte/store';

export const tooltipsOpen = writable<number>(0);
export const currentOpenTooltip = writable<string | null>(null);
