#!/usr/bin/env Rscript
# plot_ggplot2.R
# 通用的 ggplot2 绘图脚本
# 从环境变量读取参数和输出路径，使用 build_ggplot 函数生成图形
quiet_library <- function(pkg) {
    suppressPackageStartupMessages(
        suppressWarnings(
            library(pkg, character.only = TRUE)
        )
    )
}

# 加载必要的库
quiet_library("tidyverse")
quiet_library("jsonlite")

# 从环境变量读取参数文件路径和输出路径
params_file <- Sys.getenv("VISUAL_PARAMS_JSON")
output_pdf <- Sys.getenv("VISUAL_OUTPUT_PDF")
output_png <- Sys.getenv("VISUAL_OUTPUT_PNG")
script_root <- Sys.getenv("R_SCRIPT_ROOT")

# 验证环境变量
if (is.null(params_file) || params_file == "") {
    stop("VISUAL_PARAMS_JSON environment variable not set")
}

if (is.null(output_pdf) || output_pdf == "") {
    stop("VISUAL_OUTPUT_PDF environment variable not set")
}

if (is.null(output_png) || output_png == "") {
    stop("VISUAL_OUTPUT_PNG environment variable not set")
}

# 读取参数
params <- fromJSON(params_file,
    simplifyVector = TRUE,
    simplifyDataFrame = FALSE, simplifyMatrix = FALSE
)

# 必须传入 ggplot2 配置
if (is.null(params$ggplot2)) {
    stop("ggplot2 configuration is required. Please provide 'ggplot2' parameter in JSON.") # nolint: line_length_linter.
}

# 加载 build_ggplot 函数库
utils_path <- file.path(script_root, "scripts", "utils", "build_ggplot.R")
if (!file.exists(utils_path)) {
    stop(paste("build_ggplot.R not found at:", utils_path))
}
source(utils_path)
# ========================================================
#                         参数读取
# ========================================================
# 读取数据
data_file <- params$data
if (is.null(data_file) || !file.exists(data_file)) {
    stop(paste("Data file not found:", data_file))
}

data <- read_json(data_file, simplifyVector = TRUE)

# 获取 ggplot2 配置
cfg <- params$ggplot2
# ========================================================
#                         数据操作
# ========================================================
x_axis <- all.vars(parse_expr(cfg$mapping$x))
y_axis <- all.vars(parse_expr(cfg$mapping$y))
x_unique <- unique(data[[x_axis]])
x_size <- length(unique(data[[x_axis]]))

ymin <- floor(min(data[[y_axis]]))
ymax <- ceiling(max(data[[y_axis]]))
# grid
grid_data <- tibble(
    !!x_axis := unique(data[[x_axis]]),
    ymin = floor(min(data[[y_axis]])),
    ymax = ceiling(max(data[[y_axis]]))
)
segment_index <- get_index_or_stop(cfg$layers, equal = "geom_segment")
cfg$layers[[segment_index]]$arguments$data <- grid_data
# annotate
annotate_index <- get_index_or_stop(cfg$layers, equal = "annotate")
arguments <- cfg$layers[[annotate_index]]$arguments
if (is.null(arguments$x)) {
    cfg$layers[[annotate_index]]$arguments$x <- c(-1, length(x_unique)) + 1
}
if (is.null(arguments$xend)) {
    cfg$layers[[annotate_index]]$arguments$xend <- c(-1, length(x_unique)) + 1
}
if (is.null(arguments$y)) {
    cfg$layers[[annotate_index]]$arguments$y <- ymin
}
if (is.null(arguments$yend)) {
    cfg$layers[[annotate_index]]$arguments$yend <- ymax
}
# hline
hline_index <- get_index_or_stop(cfg$layers, equal = "geom_hline")
if (is.null(cfg$layers[[hline_index]]$arguments$yintercept)) {
    cfg$layers[[hline_index]]$arguments$yintercept <- c(ymin, ymax)
}
# textpath
textpath_index <- get_index_or_stop(cfg$layers, equal = "geom_textpath")
cfg$layers[[textpath_index]]$mapping$y <- ymax
cfg$layers[[textpath_index]]$arguments$data <- distinct(data, !!sym(x_axis))
# fill_manual
fill_manual <- get_index_or_stop(cfg$scales, equal = "scale_fill_manual")
col_values <- cfg$scales[[fill_manual]]$arguments$values
if (length(col_values) < x_size) {
    cfg$scales[[fill_manual]]$arguments$values <- colorRampPalette(col_values)(x_size) # nolint: line_length_linter.
}
# y_continuous
y_continuous <- get_index_or_stop(cfg$scales, equal = "scale_y_continuous")
arguments <- cfg$scales[[y_continuous]]$arguments
if (is.null(arguments$limits)) {
    cfg$scales[[y_continuous]]$arguments$limits <- c(-2, ymax + 1)
}

if (is.null(arguments$breaks)) {
    cfg$scales[[y_continuous]]$arguments$breaks <- seq(ymin, ymax, length.out = 5) # nolint: line_length_linter.
}
# ========================================================
#                         图形绘制
# ========================================================
# 使用 build_ggplot 生成图形
p <- build_ggplot(cfg, data)

# 获取尺寸（默认值：800x600）
width <- ifelse(is.null(cfg$width), 800, as.integer(cfg$width))
height <- ifelse(is.null(cfg$height), 600, as.integer(cfg$height))

# 保存为PDF
ggsave(
    filename = output_pdf,
    plot = p,
    width = width / 100, # 转换为英寸
    height = height / 100,
    units = "in",
    device = "pdf"
)

# 保存为PNG
ggsave(
    filename = output_png,
    plot = p,
    width = width / 100, # 转换为英寸
    height = height / 100,
    units = "in",
    dpi = 300,
    device = "png"
)

cat("Plot saved to PDF:", output_pdf, "\n")
cat("Plot saved to PNG:", output_png, "\n")
