import { useState } from "react";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";
import SvgIcon from "@mui/material/SvgIcon";
import TextField from "@mui/material/TextField";
import type { TextFieldProps } from "@mui/material/TextField";

type PasswordFieldProps = Omit<TextFieldProps, "type" | "slotProps"> & {
  visibilityTarget?: string;
};

export default function PasswordField({
  visibilityTarget = "пароль",
  ...props
}: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);
  const action = `${visible ? "Скрыть" : "Показать"} ${visibilityTarget}`;

  return (
    <TextField
      {...props}
      type={visible ? "text" : "password"}
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                type="button"
                edge="end"
                size="small"
                disabled={props.disabled}
                aria-label={action}
                aria-pressed={visible}
                title={action}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => setVisible((previous) => !previous)}
              >
                <SvgIcon fontSize="small" aria-hidden="true">
                  <path
                    d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
                  {!visible ? (
                    <path d="M3 3 21 21" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  ) : null}
                </SvgIcon>
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}
