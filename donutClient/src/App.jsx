import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { ThemeProvider } from './context/ThemeContext'
import LandingPage from './components/LandingPage/LandingPage'
import AuthForm from './components/AuthForm/AuthForm'
import RegisterForm from './components/RegisterForm/RegisterForm'
import Dashboard from './components/Dashboard/Dashboard'
import CreateNewDonut from './components/CreateNewDonut/CreateNewDonut'
import './App.css'

function AppContent() {
  const navigate = useNavigate()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing user session on app load
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser))
      } catch (error) {
        console.error('Error parsing saved user:', error)
        localStorage.removeItem('user')
      }
    }
    setIsLoading(false)
  }, [])

  const handleLogin = () => navigate('/login')
  const handleRegister = () => navigate('/register')
  const goBack = () => navigate('/')

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
    navigate('/dashboard')
  }

  const handleRegistrationSuccess = (userData) => {
    console.log('Registration successful!', userData)
    navigate('/')
  }

  const handleCreateDonutSuccess = (newDonut) => {
    console.log('DONUT created successfully!', newDonut)
    navigate('/dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    localStorage.removeItem('user')
    navigate('/')
  }

  if (isLoading) {
    return <div className="app loading">Loading...</div>
  }

  // Determine if we should use centered layout (for auth pages when not logged in)
  const shouldCenter = !user && (location.pathname === '/' || location.pathname === '/login' || location.pathname === '/register')

  return (
    <div className={`app ${shouldCenter ? 'centered' : ''}`}>
      <Routes>
        <Route path="/" element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
          )
        } />

        <Route path="/login" element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <AuthForm onBack={goBack} onLoginSuccess={handleLoginSuccess} />
          )
        } />

        <Route path="/register" element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <RegisterForm onBack={goBack} onSuccess={handleRegistrationSuccess} />
          )
        } />

        <Route path="/dashboard" element={
          user ? (
            <Dashboard user={user} onLogout={handleLogout} />
          ) : (
            <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
          )
        } />

        <Route path="/create" element={
          user ? (
            <CreateNewDonut
              user={user}
              onBack={() => navigate('/dashboard')}
              onSuccess={handleCreateDonutSuccess}
            />
          ) : (
            <LandingPage onLogin={handleLogin} onRegister={handleRegister} />
          )
        } />
      </Routes>
    </div>
  )
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </Router>
  )
}

export default App
