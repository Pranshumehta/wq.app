import React from 'react';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import { useContextTitle, useComponents } from '@wq/react';

export default function Header() {
    const title = useContextTitle(),
        { Breadcrumbs } = useComponents();
    return (
        <>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6">{title}</Typography>
                </Toolbar>
            </AppBar>
            <Breadcrumbs />
        </>
    );
}
