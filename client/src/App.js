import { Routes, BrowserRouter as Router, Route } from 'react-router-dom';
import Entry from './components/Entry';
import VideoCall from './components/VideoCall';

function App() {
  return (
    <Router>
      <Routes>
        <Route exact path='/' element={<Entry />} />
        <Route exact path='/:room' element={<VideoCall />} />
      </Routes >
    </Router >
  );
}

export default App;