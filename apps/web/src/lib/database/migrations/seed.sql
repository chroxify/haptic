-- Insert a collection
INSERT INTO collection (path, name, last_opened) 
VALUES ('/Haptic', 'Haptic', CURRENT_TIMESTAMP);

-- Insert README.md
INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder) 
VALUES ('/Haptic/README.md', 'README.md', '/Haptic', '/Haptic', 'Haptic is a new local-first & privacy-focused, open-source home for your markdown notes. It''s minimal, lightweight, efficient, and aims to have _all you need and nothing you don''t_.

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
VALUES ('/Haptic/Supported Devices.md', 'Supported Devices.md', '/Haptic', '/Haptic', 'Haptic offers a seamless experience across multiple platforms, with ongoing development to expand accessibility.

### Currently Supported

#### Mac
* **Full Support**: Enjoy the complete Haptic experience with the dedicated macOS application

#### Web
* **Browser Access**: Use Haptic directly in your web browser, from any device
* **Note**: Functionality is currently limited on mobile devices

### Coming Soon

We''re actively working to bring Haptic to more platforms:

#### Windows
* Dedicated application in active development

#### Linux
* Support planned for future releases

#### Mobile
* Native apps for smartphones and tablets on the horizon

Stay tuned for updates as we expand Haptic''s reach across devices and operating systems! You can support our development efforts by [sponsoring the project](https://haptic.md/sponsor).
', false);

-- Insert Why Haptic.md
INSERT INTO entry (path, name, parent_path, collection_path, content, is_folder)
VALUES ('/Haptic/Why Haptic.md', 'Why Haptic.md', '/Haptic', '/Haptic', 'We built Haptic to make markdown writing simpler and more accessible. We believe that many existing editors are too complex for simple use cases and day-to-day note writing, so we decided to fix that.

### What Makes Haptic Special

1. **Ready to Use**: Open Haptic and start writing. No setup needed.
2. **Simple Design**: Clean interface so you can focus on your writing.
3. **Write Anywhere**: Use Haptic on any computer with internet. Great for public or work computers where you can''t download software.
4. **Made for Everyone**: If other editors feel overwhelming, you''ll like Haptic.
5. **Open Source**: Self-host your own instance, giving you full control over your setup.

Haptic is all about making writing easier. We''ve left out extra features to keep things simple and help you get your ideas down without fuss.

---

**Note**: If you''re looking for a markdown editor with plugin systems, complex setups, or feature-packed interfaces, Haptic might not be for you. But if you want something straightforward that just works, give Haptic a try!
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