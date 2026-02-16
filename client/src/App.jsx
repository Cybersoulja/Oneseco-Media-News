import { useState } from 'react'
import Header from './components/Header'
import StoryList from './components/StoryList'
import SubmitStory from './components/SubmitStory'

function App() {
  const [view, setView] = useState('list'); // 'list' or 'submit'

  return (
    <div className="container">
      <Header setView={setView} />
      <main>
        {view === 'list' ? (
          <StoryList />
        ) : (
          <SubmitStory onSubmitted={() => setView('list')} />
        )}
      </main>
    </div>
  )
}

export default App
