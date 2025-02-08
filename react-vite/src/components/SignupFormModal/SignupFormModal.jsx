import { useState } from "react";
import { useDispatch } from "react-redux";
import { useModal } from "../../context/Modal";
import { thunkSignup } from "../../redux/session";
import "./SignupForm.css";

function SignupFormModal() {
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userType, setUserType] = useState("RECIPIENT");
  const [errors, setErrors] = useState({});
  const { closeModal } = useModal();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({}); // Clear previous errors

    if (password !== confirmPassword) {
      setErrors({
        confirmPassword: "Confirm Password field must be the same as the Password field",
      });
      return;
    }

    try {
      const serverResponse = await dispatch(
        thunkSignup({
          email,
          username,
          password,
          user_type: userType
        })
      );

      if (serverResponse?.success) {
        // Signup successful
        closeModal();
      } else {
        // Server returned errors
        setErrors(serverResponse);
      }
    } catch (error) {
      setErrors({ server: "An unexpected error occurred. Please try again." });
    }
  };

  return (
    <>
      <h1>Sign Up</h1>
      {errors.server && <p>{errors.server}</p>}
      <form onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        {errors.email && <p>{errors.email}</p>}
        <label>
          Username
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </label>
        {errors.username && <p>{errors.username}</p>}
        <label>
          Password
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        {errors.password && <p>{errors.password}</p>}
        <label>
          Confirm Password
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </label>
        {errors.confirmPassword && <p>{errors.confirmPassword}</p>}
        
        <label>
          I want to
          <select
            value={userType}
            onChange={(e) => setUserType(e.target.value)}
            required
          >
            <option value="RECIPIENT">Receive Food</option>
            <option value="PROVIDER">Provide Food</option>
          </select>
        </label>
        {errors.user_type && <p>{errors.user_type}</p>}
        
        <button type="submit">Sign Up</button>
      </form>
    </>
  );
}

export default SignupFormModal;
