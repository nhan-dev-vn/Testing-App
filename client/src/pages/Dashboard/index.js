import axios from '../../utils/axios';
import React, { useState, useEffect, useCallback } from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import { showDateTime } from '../../utils/date';

const Component = () => {
    const navigate = useNavigate();
    const [examTests, setExamTests] = useState([]);

    const getData = useCallback(async () => {
        try {
            const response = await axios.get('/exam-tests');
            setExamTests(response.data);
        } catch (error) {
            alert(JSON.stringify(error))
        }
    }, []);

    useEffect(() => {
        getData();
    }, [getData]);

    return (
        <div>
            <h1>Dashboard</h1>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Test</TableCell>
                            <TableCell>Started At</TableCell>
                            <TableCell>Finished At</TableCell>
                            <TableCell>Score</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {examTests.map((test) => (
                            <TableRow
                                key={test._id}
                            >
                                <TableCell>{test.examinee.name}</TableCell>
                                <TableCell>{test.exam.title}</TableCell>
                                <TableCell>{showDateTime(test.startedAt)}</TableCell>
                                <TableCell>{showDateTime(test.finishedAt)}</TableCell>
                                <TableCell>{test.score?.total || 0}/{test.exam.fullScore}</TableCell>
                                <TableCell>
                                    <Button onClick={() => navigate(`/review/${test._id}`)}>Review</Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Component;
