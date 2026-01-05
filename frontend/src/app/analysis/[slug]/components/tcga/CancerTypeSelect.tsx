"use client";

import { FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { TCGA_CANCER_TYPES } from "./constants";

export interface CancerTypeSelectProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  excludeAll?: boolean;
}

export function CancerTypeSelect({
  value,
  onChange,
  label = "癌种",
  fullWidth = true,
  excludeAll = false,
}: CancerTypeSelectProps) {
  const options = excludeAll
    ? TCGA_CANCER_TYPES.filter((t) => t.value !== "all")
    : TCGA_CANCER_TYPES;

  return (
    <FormControl fullWidth={fullWidth}>
      <InputLabel>{label}</InputLabel>
      <Select
        value={value ?? ""}
        label={label}
        onChange={(e) => onChange(e.target.value)}
        MenuProps={{
          PaperProps: {
            style: {
              maxHeight: 300,
              overflow: "auto",
            },
          },
          anchorOrigin: {
            vertical: "bottom",
            horizontal: "left",
          },
          transformOrigin: {
            vertical: "top",
            horizontal: "left",
          },
        }}
      >
        {options.map((type) => (
          <MenuItem key={type.value} value={type.value}>
            {type.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}
