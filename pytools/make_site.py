import os
import mistune
from bs4 import BeautifulSoup
import glob

# Configuration
CONFIG = {
    'source_dir': 'wiki',
    'output_dir': 'site',
    'stylesheet': 'style.css',
    'template': """
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{title}</title>
    <link rel="stylesheet" href="{stylesheet}">
</head>
<body>
{content}
</body>
</html>
"""
}

def get_title_from_html(html):
    """Extracts the first h1 tag to use as a title."""
    soup = BeautifulSoup(html, 'html.parser')
    h1 = soup.find('h1')
    return h1.text if h1 else 'Untitled'

def main():
    """Main function to generate the site."""
    source_dir = CONFIG['source_dir']
    output_dir = CONFIG['output_dir']
    stylesheet = CONFIG['stylesheet']
    template = CONFIG['template']

    # Ensure output directory exists
    os.makedirs(output_dir, exist_ok=True)

    # Find all markdown files
    md_files = glob.glob(os.path.join(source_dir, '*.md'))

    for md_file in md_files:
        with open(md_file, 'r', encoding='utf-8') as f:
            md_content = f.read()

        # Convert markdown to HTML
        html_content = mistune.html(md_content)

        # Get title from the content
        title = get_title_from_html(html_content)

        # Create the full HTML page using the template
        full_html = template.format(
            title=title,
            stylesheet=stylesheet,
            content=html_content
        )

        # Determine output filename
        base_name = os.path.basename(md_file)
        file_name, _ = os.path.splitext(base_name)
        output_path = os.path.join(output_dir, f"{file_name}.html")

        # Write the output file
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(full_html)

        print(f"Generated: {output_path}")

if __name__ == '__main__':
    main()
