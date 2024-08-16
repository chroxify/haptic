import { db } from '@/database/client';
import { collectionSettings as collectionSettingsTable } from '@/database/schema';
import { appSettings, collection, collectionSettings } from '@/store';
import type { AppSettingsParams, CollectionSettingsParams } from '@/types';
import { eq } from 'drizzle-orm';
import { get } from 'svelte/store';

export const loadSettings = async (loadApp: boolean, loadCollection: boolean) => {
	if (loadApp) {
		// Load app settings from local storage
		const appSettingsData = window.localStorage.getItem('appSettings');
		if (!appSettingsData) {
			setSettings('app');
		} else {
			appSettings.set(JSON.parse(appSettingsData));
		}
	}

	if (loadCollection) {
		const collectionSettingsData = await db
			.select()
			.from(collectionSettingsTable)
			.where(eq(collectionSettingsTable.collectionPath, get(collection)));
		if (!collectionSettingsData || collectionSettingsData.length === 0) {
			setSettings('collection');
		} else {
			collectionSettings.set({
				editor: collectionSettingsData[0].editor as CollectionSettingsParams['editor'],
				notes: collectionSettingsData[0].notes as CollectionSettingsParams['notes']
			});
		}
	}
};

export const setSettings = async (
	settingsType: 'app' | 'collection',
	value?: AppSettingsParams | CollectionSettingsParams
) => {
	if (settingsType === 'app') {
		appSettings.set((value ?? get(appSettings)) as AppSettingsParams);
		window.localStorage.setItem('appSettings', JSON.stringify(value ?? get(appSettings)));
	}
	if (settingsType === 'collection') {
		collectionSettings.set((value ?? get(collectionSettings)) as CollectionSettingsParams);
		await db
			.insert(collectionSettingsTable)
			.values({
				collectionPath: get(collection),
				editor: ((value ?? get(collectionSettings)) as CollectionSettingsParams).editor,
				notes: ((value ?? get(collectionSettings)) as CollectionSettingsParams).notes
			})
			.onConflictDoUpdate({
				target: collectionSettingsTable.collectionPath,
				set: {
					editor: ((value ?? get(collectionSettings)) as CollectionSettingsParams).editor,
					notes: ((value ?? get(collectionSettings)) as CollectionSettingsParams).notes
				}
			});
	}
};
