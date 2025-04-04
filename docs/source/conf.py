# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = 'Snakemon'
copyright = '2025, Bilgehan' # Update with current year and your name/org
author = 'Bilgehan' # Update with your name/org
release = '0.1.0' # The short X.Y version
version = '0.1.0' # The full version, including alpha/beta/rc tags

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

from sphinxawesome_theme.postprocess import Icons

extensions = [
    'sphinxawesome_theme', # Add the theme
    # Add other extensions here, e.g.:
    # 'sphinx.ext.autodoc',
    # 'sphinx.ext.napoleon',
    # 'myst_parser', # If you want to use Markdown files
]

templates_path = ['_templates']
exclude_patterns = []

# The master toctree document.
root_doc = 'index'


# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = 'sphinxawesome_theme'
html_theme_options = {
    "awesome_external_links": True,
    "awesome_headerlinks": True,
    "show_prev_next": False,
}
html_permalinks_icon = Icons.permalinks_icon
html_static_path = ['_static']

# Example theme options (see theme docs for more)
# html_theme_options = {
#     'collapse_navigation': False,
#     'sticky_navigation': True,
#     'navigation_depth': 4,
#     'includehidden': True,
#     'titles_only': False
# } 