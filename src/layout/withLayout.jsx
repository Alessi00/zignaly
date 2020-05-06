import React, { useMemo } from "react";
import './layout.sass';
import Header from "../components/Navigation/Header";
import { getDisplayName } from "../utils";
import { ThemeProvider, createMuiTheme } from '@material-ui/core/styles';
import { CssBaseline, Box } from '@material-ui/core';
import "../styles/common.sass";
import themeData from '../services/theme';
import { useSelector } from "react-redux";
import Sidebar from "../components/Navigation/Sidebar";
import FAQ from '../components/FAQ';

const withLayout = Component => {
    const WrapperComponent = props => {
        const darkStyle = useSelector(state => state.settings.darkStyle)
        const theme = useMemo(() => createMuiTheme(themeData(darkStyle)),[darkStyle])

        return (
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <Box bgcolor="background.default" className={"app"}>
                    <Header />
                    <Box display="flex" flexDirection="row" flexWrap="nowrap" className={"body"}>
                        <Box className={"side"}>
                            <Sidebar />
                        </Box>
                        <Box className={"content"}>
                            <Component {...props} />
                        </Box>
                    </Box>
                    <Box className={"footer"}>
                        <FAQ />
                    </Box>
                </Box>
            </ThemeProvider>
        );
    };
    WrapperComponent.displayName = `Layout(${getDisplayName(Component)})`;
    return WrapperComponent;
};

export default withLayout;
