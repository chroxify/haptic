-- Insert a collection
INSERT INTO collection (path, name, last_opened) 
VALUES ('/Haptic', 'Haptic', CURRENT_TIMESTAMP);

-- Insert README.md
INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder) 
VALUES ('/Haptic/README.md', 'README.md', '/Haptic', '/Haptic', 'Haptic is a new local-first & privacy-focused, open-source home for your markdown notes. It''s minimal, lightweight, efficient, and aims to have **_all you need and nothing you don''t_**.

---

If you''d like to learn more about Haptic, why it''s being built, what its goals are, and how it differs from all the other markdown editors out there, click around the other files in this collection.

## Tech Stack

- [Tauri](https://tauri.app/) – Desktop App
- [PGlite](https://pglite.dev/) – Local Database
- [Svelte](https://kit.svelte.dev/) – Framework
- [Tailwind](https://tailwindcss.com/) – CSS
- [Shadcn/ui](https://www.shadcn-svelte.com/) – Component Library
- [Vercel](https://vercel.com/) – Hosting

## Deploy Your Own

If you''re interested in self-hosting your own web instance of Haptic, please check [GitHub](https://haptic.md/github) for instructions.

## Roadmap

Haptic is currently still in active development. Here are some of the features planned for the future:

- [ ] Haptic Sync
- [ ] Mobile support for the web app (Currently dependent on PGlite support for mobile)
- [ ] Native mobile apps for iOS & Android
- [ ] Windows & Linux support for the desktop app

and much, much more, so stay tuned!

## Contributing

We would love to have your help in making Haptic better!

Here''s how you can contribute:

- [Report a bug](https://github.com/chroxify/haptic/issues/new?labels=bug) you found while using Haptic
- [Request a feature](https://github.com/chroxify/haptic/issues/new?labels=enhancement) that you think will be useful
- [Submit a pull request](https://github.com/chroxify/haptic/pulls) if you want to contribute with new features or bug fixes

## License

Haptic is licensed under the [GNU Affero General Public License Version 3 (AGPLv3)](https://github.com/chroxify/haptic/blob/main/LICENSE).
', false);

-- Insert Supported Devices.md
INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder)
VALUES ('/Haptic/Supported Devices.md', 'Supported Devices.md', '/Haptic', '/Haptic', 'Haptic is accessible across various platforms. Currently supported devices:

- **Mac**: Fully supported with a dedicated app.
- **Web App**: Accessible via web browsers, but not functional on mobile.

### Coming Soon

- **Windows**: Dedicated app in development.
- **Linux**: Support planned for the future.
- **Mobile App**: Coming soon for smartphones and tablets.
', false);

-- Insert Why Haptic.md
INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder)
VALUES ('/Haptic/Why Haptic.md', 'Why Haptic.md', '/Haptic', '/Haptic', 'Haptic was built to create a markdown editor focused on simplicity and accessibility, addressing the complexity of existing editors.

---

If you seek a feature-rich markdown editor, Haptic may not be for you.

## Core Reasons for Building Haptic:

1. **Out-of-the-Box Functionality**: Designed for immediate use, allowing users to start writing without setup.

2. **Simplicity**: A clean, intuitive interface minimizes distractions for focused writing.

3. **Accessibility**: Users can access their work from any machine, crucial for environments with restricted downloads. (e.g., public or work computers)

4. **User-Centric Design**: Haptic caters to users overwhelmed by other editors, promoting a more enjoyable writing experience.

In essence, Haptic aims to provide a straightforward and efficient writing experience without unnecessary features.
', false);

-- Insert 10 entries with daily task todos in markdown format
DO $$
DECLARE
    i INT;
    task_date DATE;
BEGIN
    FOR i IN 0..9 LOOP
        task_date := CURRENT_DATE - i;
        INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder, size, created_at, updated_at) VALUES
        (format('%s.md', to_char(task_date, 'YYYY-MM-DD')),
         to_char(task_date, 'YYYY-MM-DD'), 
         '/Haptic/.haptic/daily', 
         '/Haptic', 
         format('This is just a simple description of what needs to be done today.'||chr(10)||'- [ ] Daily Task for %s',
            to_char(task_date, 'DDth Mon YYYY')), 
         false, 
         NULL, 
         CURRENT_TIMESTAMP, 
         CURRENT_TIMESTAMP);
    END LOOP;
END $$;