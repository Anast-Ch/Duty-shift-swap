import { createTheme } from "@mui/material/styles";

const colors = {
  sky: "#A8C1D9",
  ink: "#1A1A1A",
  cream: "#F5E6D3",
  olive: "#6B705C",
  terracotta: "#D96C3A",
};

const bodyFont =
  '"Segoe UI", system-ui, -apple-system, Roboto, Arial, sans-serif';
const headingFont = 'Georgia, "Times New Roman", serif';

const appTheme = createTheme({
  palette: {
    background: { default: colors.sky, paper: colors.cream },
    text: { primary: colors.ink, secondary: colors.ink },
    primary: { main: colors.olive, contrastText: colors.cream },
    secondary: { main: colors.terracotta, contrastText: colors.ink },
    error: { main: colors.ink, contrastText: colors.cream },
    warning: { main: colors.olive, contrastText: colors.cream },
    info: { main: colors.olive, contrastText: colors.cream },
    success: { main: colors.olive, contrastText: colors.cream },
    divider: colors.olive,
  },
  typography: {
    fontFamily: bodyFont,
    h4: { fontFamily: headingFont, fontWeight: 700 },
    h5: { fontFamily: headingFont, fontWeight: 700 },
    h6: { fontFamily: headingFont, fontWeight: 700 },
  },
  shape: { borderRadius: 4 },
  components: {
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
            transition: "color 0.2s",
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
    },
    MuiDialog: {
      styleOverrides: { paper: { boxShadow: "none" } },
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
    MuiAlert: {
      defaultProps: { variant: "outlined" },
      styleOverrides: {
        outlined: ({ theme }) => ({
          backgroundColor: theme.palette.background.paper,
        }),
        message: ({ theme }) => ({ color: theme.palette.text.primary }),
      },
    },
    MuiTableCell: {
      styleOverrides: { head: { fontWeight: 700 } },
    },
  },
});

export default appTheme;
