# Joshua Gilligan's website

Jekyll site for GitHub Pages. The homepage is `index.md`; the blog index is `blog.html`.

## Write a blog post

Use `_drafts/first-post.md` as a template. Save a finished post in `_posts/` with a date-prefixed filename, for example `_posts/2026-09-07-post-title.md`. Set its title and short description in the front matter, then write the article in Markdown below it. The blog lists published posts newest first. Drafts and future-dated posts are excluded from the public build.

Posts use `_layouts/post.html` and receive URLs such as `/blog/post-title/`. Navigation, typography and article styles are shared across the site. The blog shows an empty state until the first post is published; no sample articles are published.

### Publish through GitHub

Open the repository on GitHub and choose **Add file → Create new file**. Name the file `_posts/YYYY-MM-DD-your-post-title.md`, using today's date or an earlier date. Paste the following, replacing the title, description and article text:

```markdown
---
title: "Your post title"
description: "A short summary."
---

Write your post here in Markdown.
```

Commit to `main`, or open and merge a pull request. GitHub Pages then publishes the article, adds it to the sidebar, and updates the latest-post preview. You can also send the text in this Codex task and ask to format and publish it.

For images, add files under `assets/images/` and reference them with `![Descriptive alt text](/assets/images/your-image.jpg)`.

Drafts in `_drafts/` are omitted from the website, but their files are visible in this public repository. Future-dated posts need a new build after their date; a future date alone does not schedule publication.

## Selected design

Thread is the homepage; Aside's paired-loop motif is used on the blog. Main navigation is horizontal, and posts appear in the journal sidebar. Experimental layout pages remain in the source but are excluded from the published build.

## Local build

Use the existing bundle with `bundle exec jekyll build`. For this checkout's Ruby 3.3 / Liquid 4.0.3 combination, use:

```sh
PATH=/opt/homebrew/opt/ruby@3.3/bin:$PATH bundle exec ruby -e 'class Object; def tainted?; false; end; def untaint; self; end; end; load Gem.bin_path("jekyll", "jekyll")' -- build
```

Preview the generated site with `python3 -m http.server 4017 --bind 127.0.0.1 --directory _site`.

## Archived project

The former MIRA page is preserved in `_archive/mira.md` and omitted from the website. Its old animation scripts are excluded from the build. Restore the page deliberately if it is needed again; its former styling is retained in Git history.
