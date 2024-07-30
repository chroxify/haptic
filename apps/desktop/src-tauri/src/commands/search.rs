use std::fs;
use std::path::Path;
use serde::Serialize;

#[derive(Serialize)]
pub struct SearchResult {
    path: String,
    context_preview: String,
}

#[tauri::command]
pub async fn search_files(
    dir_path: String,
    query: String,
    case_sensitive: Option<bool>,
    recursive: Option<bool>,
    match_word: Option<bool>,
    extension: Option<String>,
) -> Result<Vec<SearchResult>, String> {
    let case_sensitive = case_sensitive.unwrap_or(false);
    let recursive = recursive.unwrap_or(true);
    let match_word = match_word.unwrap_or(false);
    let extension = extension.unwrap_or_else(|| ".md".to_string());

    let files_in_path = read_path_files(&dir_path, recursive, &extension);
    let mut results = Vec::new();

    for file in files_in_path {
        let contexts = check_query_in_file(&file, &query, case_sensitive, match_word);
        for context in contexts {
            results.push(SearchResult {
                path: file.clone(),
                context_preview: context,
            });
        }
    }

    Ok(results)
}

fn check_query_in_file(path: &str, query: &str, case_sensitive: bool, match_word: bool) -> Vec<String> {
    if let Ok(file_content) = fs::read_to_string(path) {
        let mut contexts = Vec::new();
        let mut _last_index = 0;

        let search_query = if match_word {
            format!(r"\b{}\b", regex::escape(query))
        } else {
            regex::escape(query)
        };

        let re = if case_sensitive {
            regex::Regex::new(&search_query).unwrap()
        } else {
            regex::Regex::new(&format!("(?i){}", search_query)).unwrap()
        };

        for mat in re.find_iter(&file_content) {
            contexts.push(extract_context(&file_content, mat.start(), mat.end() - mat.start()));
            _last_index = mat.end();
        }

        contexts
    } else {
        Vec::new()
    }
}

fn extract_context(content: &str, index: usize, query_len: usize) -> String {
    let start = content[..index].rfind("\n\n").map_or(0, |i| i + 2);
    let end = content[index + query_len..].find("\n\n").map_or(content.len(), |i| index + query_len + i);

    let context = &content[start..end];
    let mut sentences: Vec<&str> = context.split(|c| c == '.' || c == '?' || c == '!').collect();

    if sentences.len() > 3 {
        let query_sentence_index = sentences.iter().position(|&s| s.contains(&content[index..index+query_len])).unwrap_or(0);
        let start_index = query_sentence_index.saturating_sub(1);
        let end_index = (query_sentence_index + 2).min(sentences.len());
        sentences = sentences[start_index..end_index].to_vec();
    }

    sentences.join(". ").trim().to_string() + "."
}

fn read_path_files(dir_path: &str, recursive: bool, extension: &str) -> Vec<String> {
    let path = Path::new(dir_path);
    if path.is_dir() {
        let mut file_paths: Vec<String> = Vec::new();
        if let Ok(entries) = fs::read_dir(path) {
            for entry in entries.flatten() {
                let entry_path = entry.path();
                if entry_path.is_dir() && recursive {
                    file_paths.extend(read_path_files(&entry_path.to_string_lossy(), recursive, extension));
                } else if entry_path.is_file() && entry_path.extension().map_or(false, |ext| ext == &extension[1..]) {
                    file_paths.push(entry_path.to_string_lossy().to_string());
                }
            }
        }
        file_paths
    } else {
        Vec::new()
    }
}