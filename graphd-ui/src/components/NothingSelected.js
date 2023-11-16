import React, { useEffect, useRef, useState } from 'react';
import { Typography, Container, Grid } from '@mui/material';
import { BarChart, PieChartOutline, StackedLineChart } from '@mui/icons-material';
import { makeStyles } from '@material-ui/core';
import { FileUpload } from './FileUpload.js';
import { PieChart } from '@material-ui/icons';
import { Box, Button, TextField } from '@mui/material';
import { SelectedChartContext } from '../contexts/SelectedChartContext.js';
const LocalStorageEmail = 'graphd-email';

const useStyles = makeStyles((theme) => ({
    container: {
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        fontSize: 96,
        color: theme.palette.primary.main,
    },
    text: {
        marginTop: theme.spacing(2),
        color: theme.palette.text.primary,
    },
}));

const NothingSelected = () => {
    const classes = useStyles();
    const inputRef = useRef();
    const { haveEmail, setHaveEmail } = React.useContext(SelectedChartContext);
    useEffect(() => {
        const graphdEmail = localStorage.getItem(LocalStorageEmail);
        setHaveEmail(graphdEmail)
    }, [])

    const [activeChart, setActiveChart] = useState(0);

    const charts = [
        <BarChart className={classes.icon} />,
        <PieChartOutline className={classes.icon} />,
        <StackedLineChart className={classes.icon} />,
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveChart((activeChart) => activeChart === charts.length - 1 ? 0 : activeChart + 1);
        }, 1500);

        return () => clearInterval(interval);
    });

    const renderChart = () => {
        return charts[activeChart];
    };

    const validateEmail = (email) => {
        return String(email)
            .toLowerCase()
            .match(
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
            );
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (inputRef.current.value && validateEmail(inputRef.current.value)) {
            localStorage.setItem(LocalStorageEmail, inputRef.current.value)
            setHaveEmail(true)
        }
    }

    return (
        <Container className={classes.container}>
            <Grid container direction="column" alignItems="center" spacing={4}>
                <Grid item>
                </Grid>
                <Grid item>
                    {renderChart()}
                </Grid>
                <Grid item>
                    <Typography variant="h4" component="h2" className={classes.text} align="center">
                        Welcome to graphd.ai
                    </Typography>
                </Grid>
                <Grid item>
                    <FileUpload />
                    {!haveEmail &&
                        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
                            <TextField
                                margin="normal"
                                required
                                fullWidth
                                id="email"
                                label="Email Address"
                                name="email"
                                autoComplete="email"
                                autoFocus
                                inputRef={inputRef}
                            />
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2, ml: 'auto', mr: 'auto' }}
                                centerRipple
                            >
                                Enter Email
                            </Button>
                        </Box>
                    }
                </Grid>
            </Grid>
        </Container>
    );
};

export { NothingSelected };
