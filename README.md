# Ihsan | Talking-Head Editing Portfolio

## Upload to GitHub from Windows

1. Right-click `Ihsan-Video-Portfolio.zip`, choose **Extract All**, and open the extracted folder. You should see a `site` folder, `.pages.yml`, `netlify.toml`, `.gitignore`, and this `README.md`.
2. Sign in at [github.com/new](https://github.com/new), name the repository `ihsan-portfolio`, and choose **Private**. Create the repository with **Add README** off, since this download already includes one.
3. On the empty repository page, click **uploading an existing file** under **Quick setup**. If the repository already contains files, choose **Add file → Upload files** instead.
4. Put File Explorer next to the browser. Select everything **inside** the extracted folder and drag the selection into GitHub’s upload area. The `site` folder goes in as a folder. You should see paths such as `site/index.html` alongside root files like `netlify.toml`.
5. Enter `Add portfolio website` as the commit message and click **Commit changes**. A commit saves the uploaded files into your repository.

## Connect Netlify

In [Netlify](https://app.netlify.com/), choose **Add new project → Import an existing project → GitHub**. Authorize Netlify for `ihsan-portfolio` and select it. Use `site` for the **Publish directory** and leave the **Build command** blank. Netlify assigns a `netlify.app` address. If your project starts private, review it there and make it public when you are ready to share.

For a quick manual preview, sign in to Netlify and drag the extracted `site` folder into [Netlify Drop](https://app.netlify.com/drop). To add automatic updates to a manual deploy later, follow [Netlify’s guide to linking a Git repository](https://docs.netlify.com/build/git-workflows/repo-permissions-linking/).

## Add a video without touching code

1. Sign in to [Pages CMS](https://app.pagescms.org/) with GitHub. Install its GitHub app for `ihsan-portfolio` and select your default branch. The included `.pages.yml` supplies the editing form.
2. Open **Portfolio → Projects**. Add a title, a style category, a video link, and a cover image. Choose **Vertical** for Reels and Shorts or **Landscape** for horizontal videos. The gallery groups matching style names into one filter.
3. Save. Pages CMS saves to GitHub and the connected Netlify project redeploys. You can also edit `site/data/portfolio.json` directly in GitHub.

Public and unlisted YouTube videos, Shorts, Vimeo, and direct HTTPS MP4 or WebM links are supported. Enable embedding and only include work you have permission to share. For larger videos, paste a hosted link. A small MP4 can also go in `site/assets/video/` with a path such as `/assets/video/my-cut.mp4` in the editor.

The four starter cards are style mockups. Replace them and the homepage preview with your real edits as you finish them. Turn off **Show the mockup label** for real projects. Confirm the Instagram profile URL or add a business email under **Contact details** before sharing the site.
