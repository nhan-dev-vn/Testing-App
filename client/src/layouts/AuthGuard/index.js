import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate } from 'react-router-dom';
import Loading from '../../pages/Loading';

const Component = ({ isAdmin, children }) => {
    const { loading, isLoggedIn, user } = useSelector((state) => state.auth);
    if (isAdmin && user.email !== 'admin@gmail.com' && isLoggedIn) return <Navigate to="/fobidden" />;

    return (
        loading ? <Loading /> :
            isLoggedIn ? children : <Navigate to="/login" />
    );
};

export default Component;
