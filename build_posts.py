import json
import os
import re

posts_dir = "posts"
output_file = "posts.json"

posts = []
for filename in os.listdir(posts_dir):
    if not filename.endswith(".md"):
        continue
    filepath = os.path.join(posts_dir, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Parse frontmatter
    fm_match = re.match(r"^---\n([\s\S]*?)\n---", content)
    if fm_match:
        fm = fm_match.group(1)
        title = re.search(r"title:\s*(.*)", fm)
        date = re.search(r"date:\s*(.*)", fm)
        tag = re.search(r"tag:\s*(.*)", fm)
        excerpt = re.search(r"excerpt:\s*(.*)", fm)
        preview_image = re.search(r"previewImage:\s*(.*)", fm)
        body = content[fm_match.end():].strip()
    else:
        title = None
        date = None
        tag = None
        excerpt = None
        preview_image = None
        body = content.strip()

    post_id = filename[:-3]  # remove .md
    post = {
        "id": post_id,
        "title": title.group(1).strip() if title else "",
        "date": date.group(1).strip() if date else "",
        "tag": tag.group(1).strip() if tag else "",
        "excerpt": excerpt.group(1).strip() if excerpt else "",
        "content": body
    }
    
    if preview_image:
        post["previewImage"] = preview_image.group(1).strip()
    
    posts.append(post)

# Sort by date descending
posts.sort(key=lambda x: x["date"], reverse=True)

with open(output_file, "w", encoding="utf-8") as f:
    json.dump(posts, f, ensure_ascii=False, indent=2)

print(f"Generated {output_file} with {len(posts)} posts.")
