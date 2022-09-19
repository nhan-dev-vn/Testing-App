import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';
import routes, { renderRoutes } from './routes';
import axios from './utils/axios';
import { actions as authActions } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const response = await axios.get('/session-login');
        dispatch(authActions.loginSuccess(response.data));
      } catch (error) {
        dispatch(authActions.loginFail());
        console.error(JSON.stringify(error));
      }
    })();
  }, [dispatch]);

  return (
    <>
      {renderRoutes(routes)}
    </>
  );
}

export default App;
