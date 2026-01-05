quiet_library <- function(pkg) {
    suppressPackageStartupMessages(
        suppressWarnings(
            library(pkg, character.only = TRUE)
        )
    )
}

quiet_library("jsonlite")
quiet_library("survival")
quiet_library("survminer")
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
#                         数据处理
# ========================================================
data <- na.omit(data)


get_info <- function(cfg) {
    time_col <- cfg$mapping$x
    status_col <- cfg$mapping$y
    group_col <- cfg$mapping$colour

    f <- as.formula(glue::glue("Surv({time_col}, {status_col}) ~ `{group_col}`")) # nolint: line_length_linter.
    fits <- survfit(f, data = data)
    fits$call$formula <- f
    pvalue <- round(surv_pvalue(fits, data = data)$pval, 3)
    x <- summary(coxph(f, data = data))
    HR <- signif(x$coef[, 2], digits = 2)
    HR.confint.lower <- signif(x$conf.int[, "lower .95"], 3)
    HR.confint.upper <- signif(x$conf.int[, "upper .95"], 3)
    CI_95 <- paste0(HR.confint.lower, "-", HR.confint.upper) # nolint: line_length_linter, object_name_linter.
    label <- glue::glue("Log-rank p = {pvalue}\nHR = {HR}({CI_95})")
    group_table <- table(data[, group_col])
    legend_labels <- sapply(names(group_table), function(name) {
        glue::glue("{name} (N = {group_table[name]})")
    })
    return(list(fit = fits, label = label, legend_labels = legend_labels))
}
info <- get_info(cfg)

surv_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "ggsurvplot"
}))
cfg$layers[[surv_index]]$arguments$fit <- info$fit
cfg$layers[[surv_index]]$arguments$data <- data
if (is.null(cfg$layers[[surv_index]]$arguments$legend.labs)) {
    cfg$layers[[surv_index]]$arguments$legend.labs <- info$legend_labels
}
cfg$mapping <- NULL

anno_index <- which(sapply(cfg$layers, function(x) {
    !is.null(x$type) && x$type == "annotate"
}))
for (i in anno_index) {
    if (is.null(cfg$layers[[i]]$arguments$label)) {
        cfg$layers[[i]]$arguments$label <- info$label
    }
}

# ========================================================
#                         图形绘制
# ========================================================
p <- build_call(cfg$layers[[surv_index]])
cfg$layers[[surv_index]] <- NULL
p$plot <- build_ggplot(cfg, data, p$plot)

# 获取尺寸（默认值：800x600）
width <- ifelse(is.null(cfg$width), 800, as.integer(cfg$width))
height <- ifelse(is.null(cfg$height), 600, as.integer(cfg$height))

# 保存为PDF
ggsave(
    filename = output_pdf,
    plot = p$plot,
    width = width / 100, # 转换为英寸
    height = height / 100,
    units = "in",
    device = "pdf"
)

# 保存为PNG
ggsave(
    filename = output_png,
    plot = p$plot,
    width = width / 100, # 转换为英寸
    height = height / 100,
    units = "in",
    dpi = 300,
    device = "png"
)

cat("Plot saved to PDF:", output_pdf, "\n")
cat("Plot saved to PNG:", output_png, "\n")
