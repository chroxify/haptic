import { bigint, boolean, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core';

export const collection = pgTable('collection', {
	path: text('path').primaryKey(),
	name: text('name').notNull(),
	lastOpened: timestamp('last_opened', { withTimezone: true }).notNull()
});

export const collectionSettings = pgTable('collection_settings', {
	collectionPath: text('collection_path')
		.primaryKey()
		.references(() => collection.path),
	editor: jsonb('editor').notNull(),
	notes: jsonb('notes').notNull()
});

export const entry = pgTable('entry', {
	path: text('path').primaryKey(),
	name: text('name'),
	parentPath: text('parent_path').notNull(),
	collectionPath: text('collection_path').references(() => collection.path),
	content: text('content'),
	isFolder: boolean('is_folder').default(false),
	size: bigint('size', { mode: 'number' }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});
