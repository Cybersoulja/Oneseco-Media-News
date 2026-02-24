import React, { useState } from 'react';
import axios from 'axios';

const SubmitStory = ({ onSubmitted }) => {
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !url) {
      alert('Title and URL are required');
      return;
    }
    try {
      await axios.post('/api/stories', { title, url });
      setTitle('');
      setUrl('');
      onSubmitted();
    } catch (error) {
      console.error('Error submitting story:', error);
      alert('Failed to submit story');
    }
  };

  return (
    <div className="submit-story">
      <h2>Submit Story</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="url">URL:</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default SubmitStory;
