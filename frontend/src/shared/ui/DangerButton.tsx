import Button from "@mui/material/Button";
import type { ButtonProps } from "@mui/material/Button";
import { alpha, darken } from "@mui/material/styles";
import type { SxProps, Theme } from "@mui/material/styles";
import { declinedColor } from "./StatusChip";

type DangerButtonProps = Omit<ButtonProps, "color" | "sx">;

const textSx: SxProps<Theme> = {
  color: declinedColor,
  "&:hover": { backgroundColor: alpha(declinedColor, 0.08) },
};

const outlinedSx: SxProps<Theme> = {
  color: declinedColor,
  borderColor: declinedColor,
  "&:hover": {
    borderColor: declinedColor,
    backgroundColor: alpha(declinedColor, 0.08),
  },
};

const containedSx: SxProps<Theme> = {
  backgroundColor: declinedColor,
  color: "background.paper",
  "&:hover": { backgroundColor: darken(declinedColor, 0.15) },
};

export default function DangerButton({
  variant = "text",
  ...rest
}: DangerButtonProps) {
  const sx =
    variant === "contained"
      ? containedSx
      : variant === "outlined"
        ? outlinedSx
        : textSx;

  return <Button color="inherit" variant={variant} sx={sx} {...rest} />;
}
