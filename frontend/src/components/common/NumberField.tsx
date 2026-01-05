import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui-components/react/number-field";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputAdornment from "@mui/material/InputAdornment";
import InputLabel from "@mui/material/InputLabel";
import Box from "@mui/material/Box";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

/**
 * This component is a placeholder for FormControl to correctly set the shrink label state on SSR.
 */
function SSRInitialFilled(_: BaseNumberField.Root.Props) {
  return null;
}
SSRInitialFilled.muiName = "Input";

export interface NumberFieldProps
  extends Omit<BaseNumberField.Root.Props, "onChange" | "onValueChange"> {
  label?: React.ReactNode;
  size?: "small" | "medium";
  error?: boolean;
  fullWidth?: boolean;
  onChange?: (value: number) => void;
}

export const NumberField = React.forwardRef<HTMLDivElement, NumberFieldProps>(
  (
    {
      id: idProp,
      label,
      error,
      size = "medium",
      fullWidth = false,
      onChange,
      value,
      ...other
    },
    ref
  ) => {
    let id = React.useId();
    if (idProp) {
      id = idProp;
    }

    // 处理值变化
    const handleValueChange = React.useCallback(
      (
        newValue: number | null,
        eventDetails: BaseNumberField.Root.ChangeEventDetails
      ) => {
        if (onChange && newValue !== null && newValue !== undefined) {
          onChange(newValue);
        }
      },
      [onChange]
    );

    const content = (
      <BaseNumberField.Root
        allowWheelScrub
        value={value}
        onValueChange={handleValueChange}
        {...other}
        render={(props, state) => (
          <FormControl
            size={size}
            ref={props.ref}
            disabled={state.disabled}
            required={state.required}
            error={error}
            variant="outlined"
            fullWidth={fullWidth}
          >
            {props.children}
          </FormControl>
        )}
      >
        <SSRInitialFilled {...other} />
        {label && <InputLabel htmlFor={id}>{label}</InputLabel>}
        <BaseNumberField.Input
          id={id}
          render={(props, state) => (
            <OutlinedInput
              label={label}
              inputRef={props.ref}
              value={state.inputValue}
              onBlur={props.onBlur}
              onChange={props.onChange}
              onKeyUp={props.onKeyUp}
              onKeyDown={props.onKeyDown}
              onFocus={props.onFocus}
              slotProps={{
                input: props,
              }}
              endAdornment={
                <InputAdornment
                  position="end"
                  sx={{
                    flexDirection: "column",
                    maxHeight: "unset",
                    alignSelf: "stretch",
                    borderLeft: "1px solid",
                    borderColor: "divider",
                    ml: 0,
                    "& button": {
                      py: 0,
                      flex: 1,
                      borderRadius: 0.5,
                    },
                  }}
                >
                  <BaseNumberField.Increment
                    render={<IconButton size={size} aria-label="Increase" />}
                  >
                    <KeyboardArrowUpIcon
                      fontSize={size}
                      sx={{ transform: "translateY(2px)" }}
                    />
                  </BaseNumberField.Increment>

                  <BaseNumberField.Decrement
                    render={<IconButton size={size} aria-label="Decrease" />}
                  >
                    <KeyboardArrowDownIcon
                      fontSize={size}
                      sx={{ transform: "translateY(-2px)" }}
                    />
                  </BaseNumberField.Decrement>
                </InputAdornment>
              }
              sx={{ pr: 0 }}
              fullWidth={fullWidth}
            />
          )}
        />
      </BaseNumberField.Root>
    );

    return (
      <Box ref={ref} sx={fullWidth ? { width: "100%" } : undefined}>
        {content}
      </Box>
    );
  }
);

NumberField.displayName = "NumberField";

export default NumberField;
