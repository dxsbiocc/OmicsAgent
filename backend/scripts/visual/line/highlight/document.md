# 区域高亮折线图

This tool renders a scatter plot using R (ggplot2).

Environment variables:

- VISUAL_PARAMS_JSON: path to a JSON file containing params
- VISUAL_OUTPUT_PNG: output PNG path

Params (with defaults):

- x_col: string ("x")
- y_col: string ("y")
- color_col: optional string (NULL)
- point_size: number (2.0)
- width: integer (800)
- height: integer (600)
- title: string ("Scatter Plot")

Sample usage: backend constructs params JSON and runs `Rscript run.R`.

Sample data: `sample.csv`
