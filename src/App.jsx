import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Navbar from './components/Navbar';
import Home from './components/pages/Home';
import Login from './components/pages/Login';
import Register from './components/pages/Register';
import TVShows from './components/pages/TVShows';
import TVShowDetail from './components/pages/TVShowDetail';
import Actors from './components/pages/Actors';
import ActorDetail from './components/pages/ActorDetail';
import Favorites from './components/pages/Favorites';
import Profile from './components/pages/Profile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/tvshows" element={<TVShows />} />
              <Route path="/tvshows/:id" element={<TVShowDetail />} />
              <Route path="/actors" element={<Actors />} />
              <Route path="/actors/:id" element={<ActorDetail />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
