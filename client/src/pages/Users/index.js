import React, { useState, useCallback, useEffect } from 'react';
import {
  Box, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Chip, Button
} from '@mui/material';
import axios from '../../utils/axios';
import { showDate } from '../../utils/date';

const Users = () => {
  const [users, setUsers] = useState([]);

  const getData = useCallback(async () => {
    try {
      const _users = await axios.get('/users');
      setUsers(_users.data || []);
    } catch (error) {
      alert(error)
    }
  }, []);

  useEffect(() => {
    getData();
  }, [getData]);

  const changeStatus = useCallback((userId, status) => async () => {
    try {
      const newStatus = status === 'active' ? 'deactive' : 'active'
      await axios.post('/users/' + userId + '/update-status', { status: newStatus  });
      setUsers(prev => prev.map((u) => u._id !== userId ? u : ({ ...u, status: newStatus  })));
    } catch (error) {
      alert('Fail');
    }
  }, []);

  return (
    <>
      <Typography textAlign="center" variant='h3'>Users</Typography>
      <TableContainer component={Paper}>
      <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>#</TableCell>
            <TableCell>Name</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Registed On</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Action</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user, idx) => (
            <TableRow
              key={user._id}
              sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
              <TableCell>
                {idx + 1}
              </TableCell>
              <TableCell>
                {user.name}
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>{showDate(user.createdAt)}</TableCell>
              <TableCell>
                <Chip label={user.status || 'new'} color={user.status === 'new' || !user.status ? 'primary' : user.status === 'active' ? 'success' : 'default'} />
              </TableCell>
              <TableCell>
                <Button variant="contained" color={user.status === 'active' ? 'error' : 'success'} size="small" onClick={changeStatus(user._id, user.status)}>{
                  user.status === 'active' ? 'Deactive' : 'Active'
                  }</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    </>
  );
};

export default Users;
