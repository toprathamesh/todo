# Video and Repo Todo List

This is a simple to-do list application that allows you to keep track of YouTube videos to watch and GitHub repositories to work on. The application is built with plain HTML, CSS, and JavaScript and uses the browser's `localStorage` to persist data, so your to-do items are saved even when you close the page.

## Features

-   **Learn Section**: Add YouTube videos to a list to watch later.
-   **Implement Section**: Add GitHub repository links with a note about what needs to be done.
-   **Data Persistence**: Your to-do lists are saved in your browser's `localStorage`, so your data is not lost on page refresh.
-   **Simple Interface**: Clean and intuitive design for easy use.

## How to Use

1.  **Add a Video**:
    -   Go to the "Learn" section.
    -   Paste a YouTube video link into the input field.
    -   Click the "Add Video" button or press `Enter`.

2.  **Add a Repository**:
    -   Go to the "Implement" section.
    -   Paste a GitHub repository link and add a note in the respective input fields.
    -   Click the "Add Repo" button or press `Enter`.

3.  **Remove an Item**:
    -   Click the "Remove" button on any video or repository item to delete it from the list.

## Local Development

To run this project locally, you can use a simple HTTP server. If you have Python installed, you can run the following command in the project directory:

```bash
python -m http.server
```

Then, open your web browser and go to `http://localhost:8000`.

## Deployment

This application can be deployed to any static site hosting service like Vercel, Netlify, or GitHub Pages. Since it's a client-side application with no backend, deployment is straightforward. 