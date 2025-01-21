import { useState } from "react";
import { thunkLogin } from "../../redux/session";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import "./LoginForm.css";
import { Navigate } from "react-router-dom";

function LoginFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const serverResponse = await dispatch(
      thunkLogin({
        email,
        password,
      })
    );

    if (serverResponse) {
      setErrors(serverResponse);
    } else {
      closeModal();
    }
  };

  const handleDemoLogin = async (role) => {
    let credentials;
    if (role === 'provider') {
      credentials = {
        email: 'provider@foodbridge.com',
        password: 'password'
      };
    } else if (role === 'admin') {
      credentials = {
        email: 'admin@foodbridge.com',
        password: 'password'
      };
    }

    const serverResponse = await dispatch(thunkLogin(credentials));
    if (!serverResponse) {
      closeModal();
    }
  };

  return (
    <div className="login-form-modal">
      <h1>Log In</h1>
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="Enter your email"
          />
          {errors.email && <p>{errors.email}</p>}
        </label>
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
          />
          {errors.password && <p>{errors.password}</p>}
        </label>
        <button type="submit">Log In</button>
      </form>
      
      <div className="demo-login-section">
        <p>Or try our demo accounts:</p>
        <div className="demo-buttons">
          <button 
            className="demo-btn provider"
            onClick={() => handleDemoLogin('provider')}
          >
            Demo Provider Login
          </button>
          <button 
            className="demo-btn admin"
            onClick={() => handleDemoLogin('admin')}
          >
            Demo Admin Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginFormModal;
