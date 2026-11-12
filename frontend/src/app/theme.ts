import { createTheme } from "@mui/material/styles";

const colors = {
  sky: "#A8C1D9",
  ink: "#1A1A1A",
  cream: "#F5E6D3",
  creamDark: "#EBD3B5",
  olive: "#6B705C",
  terracotta: "#D96C3A",
  red: "#B3261E",
};

const bodyFont =
  '"Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
const headingFont = 'Georgia, "Times New Roman", serif';

const headingStyle = {
  fontFamily: headingFont,
  fontWeight: 700,
  lineHeight: 1.25,
  letterSpacing: "-0.01em",
};

const baseCss = `
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;

const appTheme = createTheme({
  palette: {
    background: { default: colors.sky, paper: colors.cream },
    text: { primary: colors.ink, secondary: colors.ink },
    primary: { main: colors.olive, contrastText: colors.cream },
    secondary: { main: colors.terracotta, contrastText: colors.ink },
    error: { main: colors.red, contrastText: colors.cream },
    warning: { main: colors.olive, contrastText: colors.cream },
    info: { main: colors.olive, contrastText: colors.cream },
    success: { main: colors.olive, contrastText: colors.cream },
    divider: colors.olive,
  },
  typography: {
    fontFamily: bodyFont,
    h4: headingStyle,
    h5: headingStyle,
    h6: headingStyle,
  },
  shape: { borderRadius: 8 },
  components: {
    MuiCssBaseline: {
      styleOverrides: baseCss,
    },
    MuiButtonBase: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&.Mui-focusVisible": {
            outline: `2px solid ${theme.palette.text.primary}`,
            outlineOffset: 2,
          },
        }),
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          transition:
            "background-color 0.2s, color 0.2s, border-color 0.2s, box-shadow 0.2s, transform 0.2s",
          "&:hover": {
            transform: "translateY(-1px)",
          },
          "&.MuiButton-contained:hover, &.MuiButton-outlined:hover": {
            boxShadow: "0 2px 6px rgba(26,26,26,0.15)",
          },
          "&.MuiButton-containedPrimary": {
            border: `1px solid ${theme.palette.primary.main}`,
            "&:hover": {
              backgroundColor: theme.palette.background.paper,
              color: theme.palette.text.primary,
              borderColor: theme.palette.divider,
            },
          },
          "&.MuiButton-outlinedPrimary": {
            color: theme.palette.text.primary,
            borderColor: theme.palette.divider,
            "&:hover": {
              borderColor: theme.palette.text.primary,
              backgroundColor: theme.palette.background.paper,
            },
          },
          "&.MuiButton-textPrimary": {
            color: theme.palette.text.primary,
            "&:hover": {
              color: theme.palette.secondary.main,
              backgroundColor: "transparent",
            },
          },
        }),
      },
    },
    MuiPaper: {
      defaultProps: { elevation: 0, variant: "outlined" },
      styleOverrides: {
        root: ({ theme }) => ({
          boxShadow: "0 1px 3px rgba(26,26,26,0.08)",
          border: `2px solid ${theme.palette.text.primary}`,
        }),
      },
    },
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: `1px solid ${theme.palette.text.primary}`,
        }),
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: { boxShadow: "0 8px 24px rgba(26,26,26,0.18)" },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: ({ theme }) => ({
          backgroundColor: theme.palette.secondary.main,
          height: 3,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 600,
          color: theme.palette.text.primary,
          "&.Mui-selected": { color: theme.palette.text.primary },
        }),
      },
    },
    MuiChip: {
      defaultProps: { size: "small" },
      styleOverrides: {
        root: ({ theme }) => ({
          color: theme.palette.text.primary,
          fontWeight: 600,
          "&.MuiChip-outlined": {
            borderColor: theme.palette.divider,
          },
          "&.MuiChip-outlinedPrimary": {
            color: theme.palette.text.primary,
            borderColor: theme.palette.primary.main,
          },
          "&.MuiChip-outlinedSecondary": {
            color: theme.palette.text.primary,
            borderColor: theme.palette.secondary.main,
            borderWidth: 2,
          },
          "&.MuiChip-filledPrimary": {
            color: theme.palette.primary.contrastText,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.text.primary,
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
          },
        }),
      },
    },
    MuiFormHelperText: {
      styleOverrides: {
        root: {
          "&.Mui-error": { animation: "fadeIn 0.2s ease-out" },
        },
      },
    },
    MuiAlert: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
          boxShadow: "none",
          animation: "fadeIn 0.25s ease-out",
        }),
        message: ({ theme }) => ({ color: theme.palette.text.primary }),
      },
      variants: [
        {
          props: { variant: "outlined", severity: "error" },
          style: ({ theme }) => ({
            color: theme.palette.error.main,
            borderColor: theme.palette.error.main,
            "& .MuiAlert-icon": { color: theme.palette.error.main },
            "& .MuiAlert-message": { color: theme.palette.error.main },
          }),
        },
      ],
    },
    MuiTableCell: {
      styleOverrides: {
        head: ({ theme }) => ({
          fontWeight: 700,
          backgroundColor: colors.creamDark,
          borderBottom: `2px solid ${theme.palette.text.primary}`,
        }),
      },
    },
    MuiTableBody: {
      styleOverrides: {
        root: {
          "& .MuiTableRow-root": { transition: "background-color 0.15s" },
          "& .MuiTableRow-root:hover": {
            backgroundColor: "rgba(107,112,92,0.08)",
          },
          "& .MuiTableRow-root:last-child td, & .MuiTableRow-root:last-child th":
            { borderBottom: 0 },
        },
      },
    },
  },
});

export default appTheme;
