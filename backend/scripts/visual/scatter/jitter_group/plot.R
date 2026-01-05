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
quiet_library("jsonlite")
quiet_library("tidyverse")
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

# ========================================================
#                         参数读取
# ========================================================
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
cate <- cfg$mapping$x
y <- cfg$mapping$y
group_name <- cfg$mapping$colour


data <- na.omit(data) %>%
    group_by(!!sym(group_name)) %>%
    mutate(hight = ifelse(!!sym(y) < 0, min(!!sym(y)), max(!!sym(y)))) %>%
    ungroup()

point_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_point"
}))
if (length(point_index) < 1) {
    stop("must have geom_point layer!")
}
p <- ggplot(data, build_aes(cfg$mapping)) +
    build_call(cfg$layers[[point_index]])

point_data <- ggplot_build(p)$data[[1]] %>%
    dplyr::select(c("x", "y", "group")) %>%
    dplyr::rename(!!cate := x, !!y := y) %>%
    mutate(symbol = data$symbol, !!group_name := data[[group_name]])

cfg$layers[[point_index]]$arguments$data <- point_data
cfg$layers[[point_index]]$arguments$position <- NULL

col_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_round_col"
}))
for (i in col_index) {
    cfg$layers[[i]]$arguments$data <- dplyr::select(data, c(cate, "hight")) %>%
        distinct()
}

tile_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_round_tile"
}))
for (i in tile_index) {
    cfg$layers[[i]]$arguments$data <- distinct(data, !!sym(cate))
}

text_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_text"
}))
for (i in text_index) {
    cfg$layers[[i]]$arguments$data <- distinct(data, !!sym(cate))
}

top_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$arguments$top)
}))
for (i in top_index) {
    top_col <- cfg$layers[[i]]$arguments$top
    cfg$layers[[i]]$arguments$top <- NULL
    topk <- cfg$layers[[i]]$arguments$top.k
    cfg$layers[[i]]$arguments$top.k <- NULL

    text_data <- group_by(point_data, group, !!sym(y) > 0) %>%
        top_n(topk, abs(!!sym(y)))

    cfg$layers[[i]]$arguments$data <- text_data
}
# ========================================================
#                         图形绘制
# ========================================================
# 使用 build_ggplot 生成图形
p <- suppressWarnings(build_ggplot(cfg, data))

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
