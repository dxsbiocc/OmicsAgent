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
data <- na.omit(data)
group <- cfg$mapping$group

rect_data <- data.frame(
    xmin = c(-Inf, 1, -Inf, 1),
    xmax = c(-1, Inf, -1, Inf),
    ymin = c(1, 1, -Inf, -Inf),
    ymax = c(Inf, Inf, -1, -1),
    group = c("L-H", "H-H", "L-L", "H-L")
)

rect_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_rect"
}))
for (i in rect_index) {
    cfg$layers[[i]]$arguments$data <- rect_data
}

use_data <- data %>%
    dplyr::filter(str_to_lower(!!sym(group)) != "none")

point_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_point"
}))
for (i in point_index) {
    if (!is.null(cfg$layers[[i]]$mapping$size)) {
        cfg$layers[[i]]$arguments$data <- use_data
    }
}

top_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$arguments$top)
}))
for (i in top_index) {
    topk <- cfg$layers[[i]]$arguments$top.k %||% 10
    cfg$layers[[i]]$arguments$top.k <- NULL

    text_data <- group_by(use_data, !!sym(group)) %>%
        top_n(topk, abs(!!sym(cfg$mapping$x)) + abs(!!sym(cfg$mapping$y)))

    cfg$layers[[i]]$arguments$data <- text_data
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
