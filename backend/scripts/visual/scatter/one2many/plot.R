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
corr_col <- sub("^[^(]*\\(([^()]*)\\).*", "\\1", cfg$mapping$size)
label_col <- cfg$mapping$label
cate_col <- cfg$mapping$colour %||% cfg$mapping$fill

data <- data %>%
    mutate(x = ifelse(!!sym(corr_col) < 0, -1, 1)) %>%
    group_by(!!sym(cate_col)) %>%
    arrange(!!sym(label_col), .by_group = TRUE) %>%
    ungroup() %>%
    mutate(y = rev(seq_len(n())), y = y - mean(y))

adjust <- 0.5
bezier_data <- dplyr::select(data, x, y) %>%
    tibble::rowid_to_column("group") %>%
    mutate(type = ifelse(x < 0, "neg", "pos")) %>%
    group_by(group) %>%
    group_modify(., function(data, group) {
        if (data$x[1] < 0) {
            data.frame(
                x = c(0, -adjust, data$x + adjust, data$x),
                y = c(0, 0, data$y, data$y),
                type = data$type
            )
        } else {
            data.frame(
                x = c(0, adjust, data$x - adjust, data$x),
                y = c(0, 0, data$y, data$y),
                type = data$type
            )
        }
    })
bezier_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_bezier"
}))
cfg$layers[[bezier_index]]$arguments$data <- bezier_data

text_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_text"
}))
cfg$layers[[text_index]]$arguments$hjust <- ifelse(data$x > 0, 0, 1)
nudge_x <- cfg$layers[[text_index]]$arguments$nudge_x
cfg$layers[[text_index]]$arguments$nudge_x <- ifelse(data$x > 0, nudge_x, -1 * nudge_x) # nolint: line_length_linter.

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
