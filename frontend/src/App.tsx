import {BrowserRouter as Router, Routes, Route} from "react-router-dom";
import {ThemeProvider, createTheme} from "@mui/material/styles"
import CssBaseline from "@mui/material/CssBaseline"
import HomePage from "./pages/Home"
import EditorPage from "@/pages/Editor.tsx";

const theme = createTheme({
    palette: {
        primary: {
            main: "#2563eb",
            dark: "#1d4ed8",
        },
        secondary: {
            main: "#7c3aed",
            dark: "#6d28d9",
        },
        background: {
            default: "#f8fafc",
            paper: "#ffffff",
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
            fontWeight: 700,
        },
        h2: {
            fontWeight: 700,
        },
        h3: {
            fontWeight: 600,
        },
    },
    shape: {
        borderRadius: 12,
    },
    components: {
        MuiCard: {
            styleOverrides: {
                root: {
                    boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
                    "&:hover": {
                        boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
                    },
                },
            },
        },
        MuiButton: {
            styleOverrides: {
                root: {
                    textTransform: "none",
                    fontWeight: 600,
                },
            },
        },
    },
})

function App() {
    return (


    <ThemeProvider theme={theme}>
        <CssBaseline/>
         <Router>
            <Routes>
                <Route path="/" element={<HomePage/>}/>
                <Route path="/workspace/:id" element={<EditorPage />}/>
            </Routes>
        </Router>
    </ThemeProvider>
)
}

export default App
