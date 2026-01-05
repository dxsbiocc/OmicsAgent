"use client";

import { Autocomplete, TextField } from "@mui/material";
import { TCGA_CANCER_TYPES } from "./constants";

export interface CancerTypeAutocompleteProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  fullWidth?: boolean;
  excludeAll?: boolean;
}

export function CancerTypeAutocomplete({
  value,
  onChange,
  label = "选择癌种（留空表示全部）",
  fullWidth = true,
  excludeAll = true,
}: CancerTypeAutocompleteProps) {
  const options = excludeAll
    ? TCGA_CANCER_TYPES.filter((t) => t.value !== "all")
    : TCGA_CANCER_TYPES;

  return (
    <Autocomplete
      multiple
      fullWidth={fullWidth}
      value={value
        .map((val: string) => TCGA_CANCER_TYPES.find((t) => t.value === val))
        .filter((item): item is (typeof TCGA_CANCER_TYPES)[number] =>
          Boolean(item)
        )}
      onChange={(_, newValue) => onChange(newValue.map((item) => item.value))}
      options={options}
      getOptionLabel={(option) => option.label}
      isOptionEqualToValue={(option, value) => option.value === value.value}
      renderInput={(p) => <TextField {...p} label={label} />}
      ListboxProps={{
        style: {
          maxHeight: 300,
        },
      }}
      slotProps={{
        paper: {
          sx: {
            maxHeight: 300,
            "& .MuiAutocomplete-listbox": {
              maxHeight: 300,
            },
          },
        },
      }}
    />
  );
}
