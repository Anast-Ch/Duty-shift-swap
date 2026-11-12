import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

export default function Spinner() {
  return (
    <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
      <CircularProgress aria-label="Загрузка" />
    </Box>
  );
}
