import React from 'react';
import {
    Box, Container
} from '@mui/material';
import TopBar from './TopBar';

const Component = ({ children }) => {
    return (
        <Box position="relative">
            <TopBar />
            <Container maxWidth="md" style={{ paddingTop: 30, paddingBottom: 30 }}>
            {children}
            </Container>
        </Box>
    );
};

export default Component;
