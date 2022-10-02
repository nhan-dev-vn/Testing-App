import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux'
import {
	TextField
} from '@mui/material'
import { actions as authActions } from '../../redux/authSlice'
import './style.css';
import axios from '../../utils/axios';

const Component = () => {
	const navigate = useNavigate();
	const dispatch = useDispatch();
	const [register, setRegister] = useState({});
	const [login, setLogin] = useState({});

	const clickSignIn = useCallback(() => {
		const container = document.getElementById('container');
		container.classList.remove("right-panel-active");
	}, []);
	const clickSignUp = useCallback(() => {
		const container = document.getElementById('container');
		container.classList.add("right-panel-active");
	}, []);
	const handleChangeRegister = useCallback((field, e) => {
		setRegister((prev) => ({
			...prev,
			[field]: e.target.value
		}));
	}, []);
	const handleChangeLogin = useCallback((field, e) => {
		setLogin((prev) => ({
			...prev,
			[field]: e.target.value
		}));
	}, []);
	const handleSignIn = useCallback(async () => {
		try {
			const response = await axios.post('/login', login)
			dispatch(authActions.loginSuccess(response.data))
			navigate('/dashboard');
		} catch (error) {
			dispatch(authActions.loginFail())
			if (error.response.data.error === 'Wait admin approve your account') alert (error.response.data.error);
			else alert("Login failed!")
		}
	}, [dispatch, login, navigate]);
	const handleSignUp = useCallback(async () => {
		try {
			const response = await axios.post('/register', register)
			alert('success');
			const container = document.getElementById('container');
			container.classList.remove("right-panel-active");
		} catch (error) {
			alert(JSON.stringify(error))
		}
	}, [register]);

	return (
		<div id="login">
			<h2>Welcome to Ridhima Test Online</h2>
			<div className="login-container" id="container">
				<div className="form-container sign-up-container">
					<div className='form'>
						<h1>Create Account</h1>
						<div className="social-container">
							<a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
							<a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
							<a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
						</div>
						<span>or use your email for registration</span>
						<TextField
							className="input"
							value={register.name}
							onChange={(e) => handleChangeRegister('name', e)}
							size="small"
							placeholder="Enter Name"
							type="text"
							required
						/>
						<TextField
							className="input"
							value={register.email}
							onChange={(e) => handleChangeRegister('email', e)}
							size="small"
							placeholder="Enter Email"
							type="email"
							required
						/>
						<TextField
							className="input"
							value={register.password}
							onChange={(e) => handleChangeRegister('password', e)}
							size="small"
							placeholder="Enter Password"
							type="password"
							required
						/>
						<button onClick={handleSignUp}>Sign Up</button>
					</div>
				</div>
				<div className="form-container sign-in-container">
					<div className='form'>
						<h1>Sign in</h1>
						<div className="social-container">
							<a href="#" className="social"><i className="fab fa-facebook-f"></i></a>
							<a href="#" className="social"><i className="fab fa-google-plus-g"></i></a>
							<a href="#" className="social"><i className="fab fa-linkedin-in"></i></a>
						</div>
						<span>or use your account</span>
						<TextField
							className="input"
							// value={register.email}
							onChange={(e) => handleChangeLogin('email', e)}
							size="small"
							placeholder="Enter Email"
							type="email"
							required
						/>
						<TextField
							className="input"
							// value={register.password}
							onChange={(e) => handleChangeLogin('password', e)}
							size="small"
							placeholder="Enter Password"
							type="password"
							required
						/>
						<a href="#">Forgot your password?</a>
						<button onClick={handleSignIn}>Sign In</button>
					</div>
				</div>
				<div className="overlay-container">
					<div className="overlay">
						<div className="overlay-panel overlay-left">
							<h1>Welcome Back!</h1>
							<p>To keep connected with us please login with your personal info</p>
							<button className="ghost" onClick={clickSignIn}>Sign In</button>
						</div>
						<div className="overlay-panel overlay-right">
							<h1>Hello, Friend!</h1>
							<p>Enter your personal details and start journey with us</p>
							<button className="ghost" onClick={clickSignUp}>Sign Up</button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Component;
