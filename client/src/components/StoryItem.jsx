import React from 'react';
import axios from 'axios';

const StoryItem = ({ story, rank, onVote }) => {
  const handleVote = async () => {
    try {
      const response = await axios.post(`/api/stories/${story.id}/vote`);
      onVote(response.data);
    } catch (error) {
      console.error('Error voting:', error);
    }
  };

  const domain = new URL(story.url).hostname;
  const timeAgo = (timestamp) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  }

  return (
    <div className="story-item">
      <div className="story-rank">{rank}.</div>
      <div className="story-vote" onClick={handleVote}>▲</div>
      <div className="story-content">
        <div className="story-title">
          <a href={story.url} target="_blank" rel="noopener noreferrer">{story.title}</a>
          <span className="story-domain">({domain})</span>
        </div>
        <div className="story-meta">
          {story.score} points by {story.user} {timeAgo(story.timestamp)} | <a href="#">hide</a> | <a href="#">comments</a>
        </div>
      </div>
    </div>
  );
};

export default StoryItem;
