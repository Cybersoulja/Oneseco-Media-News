const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, '../client/dist')));

// In-memory data store
let stories = [
    {
        id: 1,
        title: "Welcome to HN Clone",
        url: "https://github.com/oneseco/oneseco-media-news",
        score: 10,
        user: "admin",
        timestamp: Date.now() - 3600000 // 1 hour ago
    },
    {
        id: 2,
        title: "Another interesting story",
        url: "https://example.com",
        score: 5,
        user: "user1",
        timestamp: Date.now() - 7200000 // 2 hours ago
    }
];

let nextId = 3;

// Routes

// Get all stories
app.get('/api/stories', (req, res) => {
    // Sort by score (descending) by default, or maybe time
    // HN main page is a mix, but let's sort by score for now to show ranking
    const sortedStories = [...stories].sort((a, b) => b.score - a.score);
    res.json(sortedStories);
});

// Submit a new story
app.post('/api/stories', (req, res) => {
    const { title, url } = req.body;

    if (!title || !url) {
        return res.status(400).json({ error: "Title and URL are required" });
    }

    const newStory = {
        id: nextId++,
        title,
        url,
        score: 0,
        user: "anonymous", // simplistic user handling
        timestamp: Date.now()
    };

    stories.push(newStory);
    res.status(201).json(newStory);
});

// Upvote a story
app.post('/api/stories/:id/vote', (req, res) => {
    const id = parseInt(req.params.id);
    const story = stories.find(s => s.id === id);

    if (!story) {
        return res.status(404).json({ error: "Story not found" });
    }

    story.score += 1;
    res.json(story);
});

// Start server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
    });
}

module.exports = app;
