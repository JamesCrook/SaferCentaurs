import os
import glob
import re
from bs4 import BeautifulSoup
import mistune

def parse_frontmatter(content):
    """Parses YAML frontmatter from a file."""
    frontmatter = {}
    match = re.match(r'---\s*\n(.*?)\n---\s*\n', content, re.DOTALL)
    if match:
        body = content[match.end():]
        yaml_content = match.group(1)
        for line in yaml_content.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                frontmatter[key.strip()] = value.strip()
        return frontmatter, body
    return {}, content

def process_index_page(md_content, templates):
    """Generates the HTML for the index page."""

    posts_md = md_content.split('\n---\n')

    page_title_match = re.search(r'page_title:\s*(.*)', posts_md[0])
    page_title = page_title_match.group(1).strip() if page_title_match else "Blog"

    articles_html = []
    post_template = templates['blog_post_item.html']

    for post_md in posts_md[1:]:
        if not post_md.strip():
            continue

        title_match = re.search(r'##\s*(.*)', post_md)
        link_match = re.search(r'link:\s*(.*)', post_md)
        meta_match = re.search(r'meta:\s*(.*?)\nimage_text:', post_md, re.DOTALL)
        image_text_match = re.search(r'image_text:\s*(.*?)\n\n### Excerpt', post_md, re.DOTALL)
        excerpt_match = re.search(r'### Excerpt\n(.*)', post_md, re.DOTALL)

        post_data = {
            'title': title_match.group(1).strip() if title_match else '',
            'link': link_match.group(1).strip() if link_match else '#',
            'meta': meta_match.group(1).strip() if meta_match else '',
            'image_text': image_text_match.group(1).strip() if image_text_match else '',
            'Excerpt': excerpt_match.group(1).strip() if excerpt_match else '',
        }

        populated_template = post_template
        for key, value in post_data.items():
            populated_template = populated_template.replace(f'{{{{{key}}}}}', value)

        articles_html.append(populated_template)

    sidebar_html = templates.get('sidebar.html', '')

    main_content = f"""
<div class="main-content">
    {sidebar_html}
    <main class="blog-section">
        <h2>{page_title}</h2>
        {''.join(articles_html)}
    </main>
</div>
    """
    return main_content

def process_discord_page(md_content, templates):
    """Generates the HTML for the discord page from structured markdown."""
    html_parts = []
    sections = md_content.split('\n\n## ')

    for section in sections:
        if not section.strip():
            continue

        lines = section.split('\n')
        header = lines[0]
        content_md = "\n".join(lines[1:])

        if header.startswith('Page Header'):
            title = re.search(r'### Title\n(.*?)\n', section, re.DOTALL).group(1)
            subtitle = re.search(r'### Subtitle\n(.*?)$', section, re.DOTALL).group(1)
            html_parts.append(f'<div class="page-header"><h1>{title}</h1><p>{subtitle}</p></div>')

        elif header.startswith('Section:'):
            match = re.match(r'Section:\s*(.*?)\s*\{(.*?)\}', header)
            title = match.group(1)
            classes = match.group(2).replace('.', ' ').strip()

            inner_html = f'<h2>{title}</h2>' + mistune.html(content_md)
            html_parts.append(f'<div class="{classes}">{inner_html}</div>')

        elif header.startswith('Info:'):
            match = re.match(r'Info:\s*(.*?)\s*\{(.*?)\}', header)
            title = match.group(1)
            classes = match.group(2).replace('.', ' ').strip()

            inner_html = f'<h3>{title}</h3>' + mistune.html(content_md)
            html_parts.append(f'<div class="{classes}">{inner_html}</div>')

        elif header.startswith('Community Info'):
            classes = re.search(r'\{(.*?)\}', header).group(1).replace('.', ' ').strip()

            cards_html = []
            cards = content_md.split('### Card:')
            for card in cards[1:]:
                card_title, card_content = card.split('\n', 1)
                cards_html.append(f'<div class="info-card"><h3>{card_title.strip()}</h3>{mistune.html(card_content)}</div>')

            html_parts.append(f'<div class="{classes}">{"".join(cards_html)}</div>')

    return "\n".join(html_parts)

def process_tool_page(md_content):
    """Extracts content and script from a tool page's markdown."""
    content_html = ""
    script_content = ""

    content_match = re.search(r'## Content\n```html\n(.*?)\n```', md_content, re.DOTALL)
    if content_match:
        content_html = content_match.group(1)

    script_match = re.search(r'## Script\n```javascript\n(.*?)\n```', md_content, re.DOTALL)
    if script_match:
        script_content = script_match.group(1)

    return content_html, script_content

def main():
    """Main function to generate the site."""
    templates = {}
    for tpl_path in glob.glob('templates/*.html'):
        name = os.path.basename(tpl_path)
        with open(tpl_path, 'r', encoding='utf-8') as f:
            templates[name] = f.read()

    md_files = glob.glob(os.path.join('wiki', '*.md'))

    for md_file in md_files:
        print(f"Processing {md_file}...")
        with open(md_file, 'r', encoding='utf-8') as f:
            content = f.read()

        frontmatter, body = parse_frontmatter(content)
        template_name = frontmatter.get('template', 'main_template.html')
        title = frontmatter.get('title', 'Untitled')

        base_template = templates.get(template_name)
        if not base_template:
            base_template = templates['main_template.html']

        html_content = ""
        scripts_html = ""

        if 'index.md' in md_file:
            html_content = process_index_page(body, templates)
        elif 'discord.md' in md_file:
            html_content = process_discord_page(body, templates)
        elif 'breadcrumbs.md' in md_file:
            html_content, scripts_html_content = process_tool_page(body)
            if scripts_html_content:
                scripts_html = f"<script>{scripts_html_content}</script>"

        final_html = base_template.replace('{{title}}', title)
        final_html = final_html.replace('{{content}}', html_content)
        final_html = final_html.replace('{{scripts}}', scripts_html)

        file_name, _ = os.path.splitext(os.path.basename(md_file))
        if template_name == 'tool_template.html':
            output_dir = 'website/tools'
        else:
            output_dir = 'website'
        output_path = os.path.join(output_dir, f"{file_name}.html")

        os.makedirs(output_dir, exist_ok=True)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(final_html)

        print(f"  -> Generated {output_path}")

if __name__ == '__main__':
    main()
