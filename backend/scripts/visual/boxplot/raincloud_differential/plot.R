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
quiet_library("gghalves")
quiet_library("quantreg")

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
x_names <- unique(data[[x_axis]])

# violin
violin_index <- get_index_or_stop(cfg$layers, equal = "geom_half_violin")
hjust <- cfg$layers[[violin_index]]$mapping$x %||% 0.05
new_data <- data %>%
    mutate(
        x = ifelse(!!sym(x_axis) == x_names[1], 1, 2),
        vx = ifelse(!!sym(x_axis) == x_names[1], 1 - hjust, 2 + hjust)
    )
cfg$layers[[violin_index]]$mapping$x <- "vx"
cfg$layers[[violin_index]]$arguments$side <- ifelse(
    new_data[[x_axis]] == x_names[1], "r", "l"
)
# jitter
jitter_index <- get_index_or_stop(cfg$layers, equal = "geom_jitter")
cfg$layers[[jitter_index]]$mapping$x <- "x"
# geom_half_round_boxplot
boxplot_index <- get_index_or_stop(cfg$layers,
    equal = "geom_half_round_boxplot"
)
for (i in boxplot_index) {
    cfg$layers[[i]]$arguments$data <- dplyr::filter(
        new_data,
        !!sym(x_axis) == x_names[i]
    )
}
# point_data
f <- as.formula(glue::glue("{y_axis} ~ {x_axis}"))
suppressWarnings(fit <- rq(f, tau = seq(0.1, 0.9, 0.1), data = data))
pvalues <- unlist(lapply(summary(fit, se = "boot", R = 1000), function(x) {
    x$coefficients[2, "Pr(>|t|)"]
}))

qual_data <- data %>%
    group_by(!!sym(x_axis)) %>%
    reframe(
        prob = seq(0.1, 0.9, by = 0.1),
        q = quantile(!!sym(y_axis), prob, na.rm = TRUE)
    ) %>%
    mutate(x = ifelse(gender == x_names[1], 1 + hjust * 2, 2 - hjust * 2)) %>%
    left_join(
        data.frame(
            prob = seq(0.1, 0.9, by = 0.1),
            signif = ifelse(pvalues < 0.05, "P < 0.05", "NS")
        )
    )
# line
line_index <- get_index_or_stop(cfg$layers, equal = "geom_line")
for (i in line_index) {
    if (is.null(cfg$layers[[i]]$mapping$colour) ||
        cfg$layers[[i]]$mapping$colour != "signif") { # nolint: indentation_linter, line_length_linter.
        next
    }
    cfg$layers[[i]]$arguments$data <- qual_data
}
# point
point_index <- get_index_or_stop(cfg$layers, equal = "geom_point")
for (i in point_index) {
    if (is.null(cfg$layers[[i]]$mapping$colour) ||
        cfg$layers[[i]]$mapping$colour != "signif") { # nolint: indentation_linter, line_length_linter.
        next
    }
    cfg$layers[[i]]$arguments$data <- qual_data
}
# annotate
format_p_value <- function(p) {
    if (p < 0.01) {
        formatC(p, format = "e", digits = 2)
    } else {
        round(p, 4)
    }
}
grouped_data <- split(data[[y_axis]], data[[x_axis]])
suppressWarnings(ks_pvalue <- ks.test(
    grouped_data[[1]],
    grouped_data[[2]]
)[["p.value"]])
suppressWarnings(wt_pvalue <- wilcox.test(
    grouped_data[[1]],
    grouped_data[[2]]
)[["p.value"]])

anno_index <- get_index_or_stop(cfg$layers, equal = "annotate")
cfg$layers[[anno_index]]$arguments$label <- c(
    paste0("Kolmogorov-Smirnov Test\nP = ", format_p_value(ks_pvalue)),
    paste0("Wilcoxon Rank Sum Test\nP = ", format_p_value(wt_pvalue))
)
# scale_x_continuous
x_continuous <- get_index_or_stop(cfg$scales, equal = "scale_x_continuous")
if (is.null(cfg$scales[[x_continuous]]$arguments$labels)) {
    cfg$scales[[x_continuous]]$arguments$labels <- x_names
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
