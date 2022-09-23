import React from 'react';
import {
    Box, Container
} from '@mui/material';
import TopBar from './TopBar';

const Component = ({ children }) => {
    return (
        <Box position="relative">
            <TopBar />
            <Container maxWidth="md">
            {children}
            </Container>
        </Box>
    );
};

export default Component;
