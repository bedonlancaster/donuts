import donutLogo from '../../assets/donut.logo.actual.png'
import donutsText from '../../assets/donuts.text.actual.png'
import './LandingPage.css'

function LandingPage({ onLogin, onRegister }) {
    return (
        <div className="landing-page">
            <div className="logo-container">
                <img src={donutLogo} alt="DONUTS Logo" className="spinning-logo" />
                <img src={donutsText} alt="DONUTS" className="donuts-text" />
            </div>

            <div className="hero-content">
                {/* <h1 className="hero-title">Welcome to DONUTS</h1>
                <p className="hero-subtitle">
                    Where producers and artists collaborate to create amazing music
                </p> */}

                <div className="auth-buttons">
                    <button className="btn btn-primary" onClick={onLogin}>
                        Log In
                    </button>
                    <button className="btn btn-secondary" onClick={onRegister}>
                        Register
                    </button>
                </div>
            </div>
        </div>
    )
}

export default LandingPage