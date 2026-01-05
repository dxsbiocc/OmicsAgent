"use client";

import { useMemo, useState } from "react";
import {
  Box,
  TextField,
  Autocomplete,
  CircularProgress,
} from "@mui/material";
import { useDebounce } from "./hooks";
import { COMMON_GENES } from "./constants";

// Optimized gene autocomplete component for large lists (2-30k genes)
export interface VirtualizedGeneAutocompleteProps {
  value: string | null;
  onChange: (value: string | null) => void;
  label?: string;
  geneList?: string[];
  maxDisplayOptions?: number;
  minSearchLength?: number;
  loading?: boolean;
}

export function VirtualizedGeneAutocomplete({
  value,
  onChange,
  label = "基因",
  geneList = COMMON_GENES,
  maxDisplayOptions = 30,
  minSearchLength = 0,
  loading = false,
}: VirtualizedGeneAutocompleteProps) {
  const [inputValue, setInputValue] = useState("");
  const debouncedInputValue = useDebounce(inputValue, 300);

  // Memoized filtered options with performance optimization
  const filteredOptions = useMemo(() => {
    if (!debouncedInputValue || debouncedInputValue.length < minSearchLength) {
      // Show top common genes when no search or search too short
      return geneList.slice(0, Math.min(50, geneList.length));
    }

    const searchLower = debouncedInputValue.toLowerCase().trim();

    // Use optimized search with early exit for large lists
    const exactMatches: string[] = [];
    const startsWithMatches: string[] = [];
    const containsMatches: string[] = [];

    for (const gene of geneList) {
      // Early exit if we have enough results
      const totalCount =
        exactMatches.length + startsWithMatches.length + containsMatches.length;
      if (totalCount >= maxDisplayOptions) break;

      const geneLower = gene.toLowerCase();

      // Prioritize exact matches, then starts with, then contains
      if (geneLower === searchLower) {
        exactMatches.push(gene);
      } else if (geneLower.startsWith(searchLower)) {
        startsWithMatches.push(gene);
      } else if (geneLower.includes(searchLower)) {
        containsMatches.push(gene);
      }
    }

    // Combine: exact matches first, then starts with, then contains
    return [...exactMatches, ...startsWithMatches, ...containsMatches].slice(
      0,
      maxDisplayOptions
    );
  }, [debouncedInputValue, geneList, maxDisplayOptions, minSearchLength]);

  return (
    <Autocomplete
      fullWidth
      value={value}
      onChange={(_, newValue) => onChange(newValue)}
      inputValue={inputValue}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      options={filteredOptions}
      loading={loading}
      filterOptions={(x) => x} // Disable default filtering, we do it manually
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={
            geneList.length > 1000
              ? `输入基因名称搜索 (${geneList.length.toLocaleString()} 个基因)`
              : "选择或输入基因"
          }
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? (
                  <CircularProgress color="inherit" size={20} />
                ) : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
        />
      )}
      renderOption={(props, option) => (
        <Box
          component="li"
          {...props}
          key={option}
          sx={{
            "&.MuiAutocomplete-option": {
              py: 1,
            },
          }}
        >
          {option}
        </Box>
      )}
      ListboxProps={{
        style: {
          maxHeight: 300, // Limit dropdown height for performance
        },
      }}
      noOptionsText={
        debouncedInputValue && debouncedInputValue.length >= minSearchLength
          ? "未找到匹配的基因"
          : geneList.length > 1000
          ? `输入至少 ${minSearchLength} 个字符开始搜索`
          : "无可用选项"
      }
      componentsProps={{
        popper: {
          modifiers: [
            {
              name: "offset",
              options: {
                offset: [0, 4],
              },
            },
          ],
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

