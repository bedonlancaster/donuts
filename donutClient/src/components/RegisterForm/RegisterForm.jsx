import { useState } from 'react'
import './RegisterForm.css'

function RegisterForm({ onBack, onSuccess }) {
    const [formData, setFormData] = useState({
        email: '',
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
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

    const validatePassword = (password) => {
        const requirements = {
            length: password.length >= 6,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)
        }

        const missing = []
        if (!requirements.length) missing.push('at least 6 characters')
        if (!requirements.uppercase) missing.push('1 uppercase letter')
        if (!requirements.lowercase) missing.push('1 lowercase letter')
        if (!requirements.number) missing.push('1 number')
        if (!requirements.special) missing.push('1 special character')

        return {
            isValid: Object.values(requirements).every(req => req),
            requirements,
            missing,
            strength: Object.values(requirements).filter(req => req).length
        }
    }

    const isFormValid = () => {
        const passwordValidation = validatePassword(formData.password)
        return (
            formData.email &&
            /\S+@\S+\.\S+/.test(formData.email) &&
            formData.username &&
            formData.username.length >= 3 &&
            formData.firstName &&
            formData.lastName &&
            passwordValidation.isValid &&
            formData.confirmPassword &&
            formData.password === formData.confirmPassword
        )
    }

    const validateForm = () => {
        const newErrors = {}

        if (!formData.email) newErrors.email = 'Email is required'
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid'

        if (!formData.username) newErrors.username = 'Username is required'
        else if (formData.username.length < 3) newErrors.username = 'Username must be at least 3 characters'

        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.lastName) newErrors.lastName = 'Last name is required'

        if (!formData.password) {
            newErrors.password = 'Password is required'
        } else {
            const passwordValidation = validatePassword(formData.password)
            if (!passwordValidation.isValid) {
                newErrors.password = `Password must include: ${passwordValidation.missing.join(', ')}`
            }
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Please confirm your password'
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match'
        }

        if (!formData.firstName) newErrors.firstName = 'First name is required'
        if (!formData.lastName) newErrors.lastName = 'Last name is required'

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateForm()) return

        setIsLoading(true)
        setErrors({})

        try {
            // Create API payload without confirmPassword
            const apiData = {
                email: formData.email,
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName
            }

            const response = await fetch('http://localhost:5000/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(apiData),
            })

            if (response.ok) {
                const userData = await response.json()
                onSuccess?.(userData)
            } else {
                const errorData = await response.json()

                if (response.status === 400) {
                    if (typeof errorData === 'string') {
                        setErrors({ general: errorData })
                    } else if (Array.isArray(errorData)) {
                        // Handle validation errors from API
                        const apiErrors = {}
                        errorData.forEach(error => {
                            if (error.description) {
                                apiErrors.general = error.description
                            }
                        })
                        setErrors(apiErrors)
                    } else {
                        setErrors({ general: 'Registration failed. Please try again.' })
                    }
                } else {
                    setErrors({ general: 'An unexpected error occurred. Please try again.' })
                }
            }
        } catch (error) {
            console.error('Registration error:', error)
            setErrors({ general: 'Network error. Please check your connection and try again.' })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="auth-container">
            <button className="back-btn" onClick={onBack}>← Back</button>

            <div className="auth-form">
                <h2>DONUTS</h2>
                <p className="auth-subtitle">Create your account and get to work</p>

                {errors.general && (
                    <div className="error-message general-error">
                        {errors.general}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="register-form">
                    {/* Name Fields */}
                    <div className="form-group">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            className={`form-input ${errors.firstName ? 'error' : ''}`}
                            placeholder="Enter your first name"
                        />
                        {errors.firstName && <span className="error-message">{errors.firstName}</span>}
                    </div>

                    <div className="form-group">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            className={`form-input ${errors.lastName ? 'error' : ''}`}
                            placeholder="Enter your last name"
                        />
                        {errors.lastName && <span className="error-message">{errors.lastName}</span>}
                    </div>

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
                        />
                        {errors.email && <span className="error-message">{errors.email}</span>}
                    </div>

                    {/* Username */}
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            className={`form-input ${errors.username ? 'error' : ''}`}
                            placeholder="Choose a unique username"
                        />
                        {errors.username && <span className="error-message">{errors.username}</span>}
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
                            placeholder="Create a strong password"
                        />
                        {errors.password && <span className="error-message">{errors.password}</span>}

                        {/* Password Requirements */}
                        {formData.password && (
                            <div className="password-requirements">
                                <div className="requirements-header">
                                    <div className="requirements-title">Password Requirements:</div>
                                    <div className="password-strength">
                                        {(() => {
                                            const validation = validatePassword(formData.password)
                                            const strength = validation.strength
                                            const strengthText = strength <= 2 ? 'Weak' : strength <= 4 ? 'Good' : 'Strong'
                                            const strengthClass = strength <= 2 ? 'weak' : strength <= 4 ? 'good' : 'strong'
                                            return (
                                                <span className={`strength-indicator ${strengthClass}`}>
                                                    {strengthText} ({strength}/5)
                                                </span>
                                            )
                                        })()}
                                    </div>
                                </div>
                                {(() => {
                                    const validation = validatePassword(formData.password)
                                    return (
                                        <div className="requirements-list">
                                            <div className={`requirement ${validation.requirements.length ? 'met' : 'unmet'}`}>
                                                {validation.requirements.length ? '✓' : '○'} At least 6 characters
                                            </div>
                                            <div className={`requirement ${validation.requirements.uppercase ? 'met' : 'unmet'}`}>
                                                {validation.requirements.uppercase ? '✓' : '○'} 1 uppercase letter (A-Z)
                                            </div>
                                            <div className={`requirement ${validation.requirements.lowercase ? 'met' : 'unmet'}`}>
                                                {validation.requirements.lowercase ? '✓' : '○'} 1 lowercase letter (a-z)
                                            </div>
                                            <div className={`requirement ${validation.requirements.number ? 'met' : 'unmet'}`}>
                                                {validation.requirements.number ? '✓' : '○'} 1 number (0-9)
                                            </div>
                                            <div className={`requirement ${validation.requirements.special ? 'met' : 'unmet'}`}>
                                                {validation.requirements.special ? '✓' : '○'} 1 special character (!@#$...)
                                            </div>
                                        </div>
                                    )
                                })()}

                                {(() => {
                                    const validation = validatePassword(formData.password)
                                    if (validation.isValid) {
                                        return (
                                            <div className="password-success">
                                                🎉 Great! Your password meets all requirements.
                                            </div>
                                        )
                                    } else if (formData.password.length > 0) {
                                        return (
                                            <div className="password-encouragement">
                                                💪 You're getting there! {validation.missing.length} more requirement{validation.missing.length !== 1 ? 's' : ''} to go.
                                            </div>
                                        )
                                    }
                                    return null
                                })()}
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                            placeholder="Confirm your password"
                        />
                        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}

                        {/* Password Match Indicator */}
                        {formData.confirmPassword && (
                            <div className={`password-match ${formData.password === formData.confirmPassword ? 'match' : 'no-match'}`}>
                                {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                            </div>
                        )}
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        className={`submit-btn ${!isFormValid() ? 'disabled' : ''}`}
                        disabled={isLoading || !isFormValid()}
                    >
                        {isLoading ? (
                            <>
                                <span className="loading-spinner"></span>
                                Creating Account...
                            </>
                        ) : (
                            'Start Collaborating'
                        )}
                    </button>

                    {/* Form Validation Message */}
                    {!isFormValid() && formData.username && formData.email && formData.password && formData.confirmPassword && (
                        <div className="form-validation-message">
                            {!validatePassword(formData.password).isValid && (
                                <div className="validation-tip">
                                    💡 Please strengthen your password to continue
                                </div>
                            )}
                            {formData.password !== formData.confirmPassword && (
                                <div className="validation-tip">
                                    🔄 Passwords don't match
                                </div>
                            )}
                        </div>
                    )}
                </form>
            </div>
        </div>
    )
}

export default RegisterForm