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
quiet_library("ggforce")

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

# 读取数据
data_file <- params$data
if (is.null(data_file) || !file.exists(data_file)) {
    stop(paste("Data file not found:", data_file))
}

data <- read_json(data_file, simplifyVector = TRUE)

# 获取 ggplot2 配置
cfg <- params$ggplot2

# 分组数量
group_count <- length(unique(data[[cfg$mapping$x]]))
# 处理显著性检验
layer_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_signif"
})) # nolint: line_length_linter.
if (group_count > 1 && length(layer_index) == 1) {
    sig_comparisons <- compare_means(
        as.formula(paste(cfg$mapping$y, cfg$mapping$x, sep = " ~ ")),
        data = data,
        method = cfg$layers[[layer_index]]$arguments$test %||% "wilcox.test",
        paired = cfg$layers[[layer_index]]$arguments$test.args$paired %||% FALSE
    ) %>%
        filter(p < cfg$layers[[layer_index]]$arguments$p.signif %||% 0.05) %>%
        dplyr::select(group1, group2) %>%
        pmap(c)
    if (length(sig_comparisons) > 0) {
        cfg$layers[[layer_index]]$arguments$comparisons <- sig_comparisons
    } else {
        cfg$layers[[layer_index]] <- NULL
    }
}
# 处理贝塞尔曲线
point_layers <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_point"
}))
bezier_layers <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "geom_bezier"
}))
if (length(point_layers) < 1 || length(bezier_layers) < 1) {
    stop("geom_point and geom_bezier are required. Please provide 'geom_point' and 'geom_bezier' in JSON.") # nolint: line_length_linter.
}
p <- ggplot(data, build_aes(cfg$mapping)) +
    geom_point(
        position = build_call(cfg$layers[[point_layers[1]]]$arguments$position)
    )

# 然后从图形中获取点的位置
bezier_data <- ggplot_build(p)$data[[1]] %>%
    dplyr::select(c("x", "y", "group")) %>%
    mutate(index = rep(1:sum(group == 1), length(unique(group)))) %>%
    group_by(index) %>% # 将数据点分组，然后根据每个分组的点创建数据
    group_modify(., function(data, group) {
        # bezier 需要 3-4 个点，我们统一设置为 4 个点，±0.3 可以自己调整曲率
        # 多个分组，根据顺序依次计算相邻分组之间的 bezier 数据，还要添加分组
        Reduce(rbind, lapply(1:(dim(data)[1] - 1), function(i) {
            data.frame(
                x = c(
                    data$x[i], data$x[i] + 0.3,
                    data$x[i + 1] - 0.3, data$x[i + 1]
                ),
                y = c(
                    data$y[i], data$y[i],
                    data$y[i + 1], data$y[i + 1]
                ),
                group = i
            )
        }))
    }) %>%
    mutate(group = paste0(index, group))
cfg$layers[[bezier_layers[1]]]$arguments$data <- bezier_data
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
