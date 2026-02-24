import React, { useEffect, useState } from 'react';
import axios from 'axios';
import StoryItem from './StoryItem';

const StoryList = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      const response = await axios.get('/api/stories');
      setStories(response.data);
    } catch (error) {
      console.error('Error fetching stories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVote = (updatedStory) => {
    setStories(stories.map(story => story.id === updatedStory.id ? updatedStory : story));
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="story-list">
      {stories.map((story, index) => (
        <StoryItem key={story.id} story={story} rank={index + 1} onVote={handleVote} />
      ))}
    </div>
  );
};

export default StoryList;
