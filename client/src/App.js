import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import './App.css';
import routes, { renderRoutes } from './routes';
import { actions as authActions } from './redux/authSlice';

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      try {
        const response = await fetch(process.env.apiUrl + '/session-login');
        const user = await response.json();
        if (response.status === 200) dispatch(authActions.loginSuccess(user));
        else throw user;
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
