create table collection (
  path text primary key,
  name text not null,
  last_opened timestamp with time zone not null
);

create table collection_settings (
  collection_path text references collection (path),
  editor jsonb not null,
  notes jsonb not null,
  primary key (collection_path)
);

create table entry (
  path text primary key,
  name text,
  parent_path text not null,
  collection_path text references collection (path),
  content text,
  is_folder boolean default false
);

alter table collection
add constraint unique_collection_path unique (path);

alter table collection_settings
add constraint unique_collection_settings_path unique (collection_path);

alter table entry
add constraint unique_entry_path unique (path);

-- Add size, created_at, and updated_at columns to entry table
ALTER TABLE entry
ADD COLUMN size bigint,
ADD COLUMN created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN updated_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP;

-- Create a function to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a trigger to automatically update the updated_at column
CREATE TRIGGER update_entry_updated_at
BEFORE UPDATE ON entry
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
