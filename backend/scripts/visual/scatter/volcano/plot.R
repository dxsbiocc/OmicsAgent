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
qvalue <- all.vars(parse_expr(cfg$mapping$y))
log2fc <- all.vars(parse_expr(cfg$mapping$x))
data <- na.omit(data)
data[[qvalue]] <- pmax(data[[qvalue]], 1e-30)


raster_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "annotation_raster"
}))
if (length(raster_index) > 0) {
    palete_colors <- cfg$layers[[raster_index]]$arguments$raster
    palete_resolution <- cfg$layers[[raster_index]]$arguments$resolution
    grad_cols <- colorRampPalette(palete_colors)(palete_resolution)
    if (cfg$layers[[raster_index]]$arguments$direction == "vertical") {
        grad <- matrix(grad_cols, ncol = 1)
    } else {
        grad <- matrix(grad_cols, nrow = 1)
    }

    cfg$layers[[raster_index]] <- annotation_raster(
        grad,
        xmin = -Inf,
        xmax = Inf,
        ymin = -Inf,
        ymax = Inf,
        interpolate = FALSE
    )
}


text_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_text_repel"
}))
if (length(text_index) > 0) {
    top_col <- cfg$layers[[text_index]]$arguments$top %||% log2fc
    cfg$layers[[text_index]]$arguments$top <- NULL
    topk <- cfg$layers[[text_index]]$arguments$top.k %||% 10
    cfg$layers[[text_index]]$arguments$top.k <- NULL

    if (all(data[[top_col]] < 1)) { # pvalue
        text_data <- dplyr::filter(data, !!sym(qvalue) < 0.05) %>%
            group_by(!!sym(log2fc) < 0) %>%
            slice_min(topk, !!sym(top_col))
    } else { # log2FC
        text_data <- dplyr::filter(data, !!sym(qvalue) < 0.05) %>%
            group_by(!!sym(log2fc) < 0) %>%
            top_n(topk, abs(!!sym(top_col)))
    }

    cfg$layers[[text_index]]$arguments$data <- text_data
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
