import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import PropTypes from 'prop-types';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing(1)
    }
}));

export default function HorizontalView({ children }) {
    const classes = useStyles();
    return <div className={classes.root}>{children}</div>;
}

HorizontalView.propTypes = {
    children: PropTypes.node
};
