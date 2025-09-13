import os
import argparse
from bs4 import BeautifulSoup

def deconstruct_index(soup):
    """Deconstructs the index.html file."""
    md_parts = []

    blog_section = soup.find('main', class_='blog-section')
    if not blog_section:
        print("[ERROR] Could not find <main class='blog-section'> in the HTML.")
        return ""

    h2_title = blog_section.find('h2')
    if not h2_title:
        print("[ERROR] Could not find <h2> title within the blog section.")
        return ""

    page_title = h2_title.get_text(strip=True)
    md_parts.append(f"page_title: {page_title}")

    articles = blog_section.find_all('article', class_='blog-post')
    for article in articles:
        post_parts = []

        title_a = article.find('h3').find('a')
        title = title_a.get_text(strip=True)
        link = title_a['href']
        post_parts.append(f"\n---\n\n## {title}")
        post_parts.append(f"link: {link}")

        meta_div = article.find('div', class_='blog-meta')
        meta_content = ''.join(str(c) for c in meta_div.contents).strip()
        post_parts.append(f"meta: {meta_content}")

        image_div = article.find('div', class_='blog-image')
        image_text = image_div.get_text(separator='<br>', strip=True)
        post_parts.append(f"image_text: {image_text}")

        excerpt_p = article.find('p', class_='blog-excerpt')
        excerpt_text = excerpt_p.get_text(strip=True)
        post_parts.append(f"\n### Excerpt\n{excerpt_text}")

        md_parts.append("\n".join(post_parts))

    return "\n".join(md_parts)

def deconstruct_discord(soup):
    """Deconstructs the discord.html file, preserving structure."""
    md_parts = []

    page_header_div = soup.find('div', class_='page-header')
    if not page_header_div:
        print("[ERROR] deconstruct_discord: Could not find 'div.page-header'")
        return ""
    container = page_header_div.parent

    for element in container.children:
        if not hasattr(element, 'name') or not element.name: continue

        if 'page-header' in element.get('class', []):
            title = element.find('h1').get_text(strip=True)
            subtitle = element.find('p').get_text(strip=True)
            md_parts.append(f"## Page Header\n### Title\n{title}\n\n### Subtitle\n{subtitle}\n")

        elif 'content-section' in element.get('class', []):
            classes = " ".join(element.get('class', []))
            title_h2 = element.find('h2')
            if title_h2:
                title = title_h2.get_text(strip=True)
                md_parts.append(f"## Section: {title} {{.{classes}}}")
                for p in element.find_all('p', recursive=False):
                    md_parts.append(p.get_text(strip=True))
                if element.find('ul'):
                    list_items = "\n".join(f"* {li.get_text(strip=True)}" for li in element.find_all('li'))
                    md_parts.append(list_items)
                if element.find('div', class_='discord-preview'):
                     preview_content = element.find('div', class_='discord-preview').get_text(separator='\n', strip=True)
                     md_parts.append(f"\n### Preview\n{preview_content}")

        elif 'patreon-info' in element.get('class', []):
            title = element.find('h3').get_text(strip=True)
            content = element.find('p').get_text(strip=True)
            md_parts.append(f"## Info: {title} {{.patreon-info}}\n{content}")

        elif 'community-info' in element.get('class', []):
            md_parts.append(f"## Community Info {{.community-info}}")
            for card in element.find_all('div', class_='info-card'):
                card_title = card.find('h3').get_text(strip=True)
                card_content = card.find('p').get_text(strip=True)
                md_parts.append(f"### Card: {card_title}\n{card_content}")

    return "\n\n".join(md_parts)

def deconstruct_tool_page(soup):
    """Deconstructs a tool page like breadcrumbs.html."""
    md_parts = []

    container = soup.find('div', class_='container')
    if not container:
        print("[ERROR] deconstruct_tool_page: Could not find 'div.container'")
        return ""

    content_html = container.prettify()
    md_parts.append(f"## Content\n```html\n{content_html}\n```")

    script_tag = soup.find('body').find('script')
    if script_tag and script_tag.string:
        script_content = script_tag.string.strip()
        md_parts.append(f"\n## Script\n```javascript\n{script_content}\n```")

    return "\n\n".join(md_parts)


def main(file_path, output_dir):
    """Main logic to deconstruct a file."""
    print(f"Deconstructing {file_path}...")
    with open(file_path, 'r', encoding='utf-8') as f:
        soup = BeautifulSoup(f, 'html.parser')

    filename = os.path.basename(file_path)

    frontmatter = [f"title: {soup.title.get_text(strip=True)}"]

    body_md = ""
    if filename == 'index.html':
        frontmatter.append("template: index.html")
        body_md = deconstruct_index(soup)
    elif filename == 'discord.html':
        frontmatter.append("template: discord.html")
        body_md = deconstruct_discord(soup)
    elif filename == 'tools/breadcrumbs.html' or filename == 'breadcrumbs.html':
        frontmatter.append("template: tool_template.html")
        body_md = deconstruct_tool_page(soup)
    else:
        print(f"  -> No deconstruction logic for {filename}, skipping.")
        return

    output_filename = os.path.splitext(filename)[0] + '.md'
    output_path = os.path.join(output_dir, output_filename)

    os.makedirs(output_dir, exist_ok=True)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write("---\n")
        f.write("\n".join(frontmatter))
        f.write("\n---\n")
        f.write(body_md)

    print(f"  -> Saved to {output_path}")


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Deconstruct HTML files into keyed-section markdown.')
    parser.add_argument('files', nargs='+', help='Path(s) to the HTML file(s) to deconstruct.')
    parser.add_argument('--output-dir', default='wiki', help='Directory to save markdown files.')
    args = parser.parse_args()

    for file_path in args.files:
        main(file_path, args.output_dir)
