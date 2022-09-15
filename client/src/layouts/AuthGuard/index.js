import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loading from '../../pages/Loading';

const Component = ({ children }) => {
    const { loading, isLoggedIn } = useSelector((state) => state.auth);

    return (
        loading ? <Loading /> :
            isLoggedIn ? children : <Navigate to="/login" />
    );
};

export default Component;
