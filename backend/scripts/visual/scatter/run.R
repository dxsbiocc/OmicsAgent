#!/usr/bin/env Rscript

# Suppress all output except errors
suppressMessages({
    library(jsonlite)
    library(ggplot2)
    library(readr)
})

# Suppress warnings
options(warn = -1)

params_path <- Sys.getenv("VISUAL_PARAMS_JSON", unset = "")
output_png <- Sys.getenv("VISUAL_OUTPUT_PNG", unset = "")

if (params_path == "" || output_png == "") {
    stop("Missing VISUAL_PARAMS_JSON or VISUAL_OUTPUT_PNG")
}

params <- fromJSON(params_path, simplifyVector = TRUE)

# Defaults
defaults <- list(
    data = NULL, # path to CSV; if NULL, use sample.csv in working dir
    x_col = "x",
    y_col = "y",
    color_col = NULL,
    point_size = 2.0,
    width = 800,
    height = 600,
    title = "Scatter Plot"
)

for (nm in names(defaults)) {
    if (is.null(params[[nm]])) params[[nm]] <- defaults[[nm]]
}

# Load data
csv_path <- params[["data"]]
if (is.null(csv_path) || csv_path == "") {
    csv_path <- file.path(getwd(), "sample.csv")
}

df <- read_csv(csv_path, show_col_types = FALSE)

# Create plot
p <- ggplot(df, aes_string(x = params$x_col, y = params$y_col)) +
    geom_point(aes_string(color = ifelse(is.null(params$color_col), NULL, params$color_col)), size = params$point_size) +
    theme_minimal() +
    ggtitle(params$title)

# Save plot with optimized settings
ggsave(filename = output_png, plot = p, width = params$width / 96, height = params$height / 96, dpi = 96, bg = "white")
