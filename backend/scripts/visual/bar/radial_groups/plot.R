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
x_axis <- all.vars(parse_expr(cfg$mapping$x))
y_axis <- all.vars(parse_expr(cfg$mapping$y))
order_axis <- all.vars(parse_expr(cfg$mapping$order_by))
group <- all.vars(parse_expr(cfg$mapping$fill))
cates <- unique(data[[group]])

new_data <- data %>%
    add_row(tibble(
        !!x_axis := paste0(x_axis, seq_along(cates)),
        !!group := rep(cates, 1),
    )) %>%
    mutate(!!group := factor(.data[[group]], levels = cates)) %>%
    # 排序，为了让统一分组绘制在一起
    # NA 值排后面，要让 NA 值排前面可以对 is.na 取反
    arrange(!!sym(group), is.na(!!sym(order_axis)), !!sym(order_axis)) %>%
    tibble::rowid_to_column("id") %>%
    mutate(
        angle = 90 - 360 * (id - 0.5) / nrow(.)
    )
cfg$mapping$x <- "id"

text_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$mapping$label) && x$mapping$label == x_axis
}))
for (i in text_index) {
    cfg$layers[[i]]$arguments$angle <- ifelse(new_data$angle < -90, new_data$angle + 180, new_data$angle)
    hjust <- cfg$layers[[i]]$arguments$hjust %||% 0.3
    cfg$layers[[i]]$arguments$hjust <- ifelse(new_data$angle > -90, hjust, 1 - hjust)
}
# new data
base_anno <- group_by(new_data, !!sym(group)) %>%
    summarise(start = min(id), end = max(id) - 1) %>%
    mutate(mid = (start + end) / 2)

data_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$arguments$inherit.aes) && isFALSE(x$arguments$inherit.aes)
}))
for (i in data_index) {
    cfg$layers[[i]]$arguments$data <- base_anno
}
# ========================================================
#                         图形绘制
# ========================================================
# 使用 build_ggplot 生成图形
p <- build_ggplot(cfg, new_data)

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
