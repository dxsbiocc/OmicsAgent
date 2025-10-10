'use client'

import { createTheme } from '@mui/material/styles'

// Brand colors
export const BRAND = {
    pink: '#ff4f81',
    yellow: '#ffc168',
    orange: '#ff6c5f',
    green: '#2dde98',
    blue: '#1cc7d0',
    red: '#f65a5b'
}

// Create the theme
const theme = createTheme({
    cssVariables: true,
    palette: {
        mode: 'light',
        primary: { main: BRAND.pink },
        secondary: { main: BRAND.yellow },
        success: { main: BRAND.green },
        info: { main: BRAND.blue },
        warning: { main: BRAND.orange },
        error: { main: BRAND.red },
        background: {
            default: '#fafafa',
            paper: '#ffffff',
        },
        text: {
            primary: '#111827',
            secondary: '#4b5563',
        },
    },
    shape: {
        borderRadius: 10,
    },
    typography: {
        fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'Noto Color Emoji'`,
        button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
        MuiButton: {
            defaultProps: { disableElevation: true },
        },
        MuiTextField: {
            styleOverrides: {
                root: {
                    '& .MuiOutlinedInput-root': {
                        backgroundColor: 'transparent',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                            borderColor: 'primary.main',
                        },
                    },
                },
            },
        },
    },
})

export default theme


