import { useState } from 'react'
import './AuthForm.css'

function AuthForm({ onBack, onLoginSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }))
        }
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

        if (!formData.password) newErrors.password = 'Password is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for cookies
                body: JSON.stringify(formData),
            })

            if (response.ok) {
                const userData = await response.json()

                // Store user data and redirect to dashboard
                localStorage.setItem('user', JSON.stringify(userData))
                onLoginSuccess(userData)
            } else {
                const errorData = await response.json()
                if (response.status === 401) {
                    setErrors({ general: 'Invalid email or password' })
                } else {
                    setErrors({ general: errorData.message || 'Login failed' })
                }
            }
        } catch (error) {
            console.error('Login error:', error)
            setErrors({ general: 'Network error. Please try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    const isFormValid = () => {
        return formData.email &&
            /\S+@\S+\.\S+/.test(formData.email) &&
            formData.password
    }

    return (
        <div className="auth-container">
            <button className="back-btn" onClick={onBack}>← Back</button>
            <div className="auth-form">
                <h2>Log In to DONUTS</h2>
                <p className="form-subtitle">Welcome back! Sign in to your account</p>

                <form onSubmit={handleSubmit} className="login-form">
                    {errors.general && (
                        <div className="error-message general-error">
                            {errors.general}
                        </div>
                    )}

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`form-input ${errors.email ? 'error' : ''}`}
                            placeholder="Enter your email address"
                            disabled={isLoading}
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`form-input ${errors.password ? 'error' : ''}`}
                            placeholder="Enter your password"
                            disabled={isLoading}
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`submit-btn ${!isFormValid() || isLoading ? 'disabled' : ''}`}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default AuthForm