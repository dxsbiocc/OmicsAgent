#!/usr/bin/env Rscript
# build_ggplot.R
quiet_library <- function(pkg) {
    suppressPackageStartupMessages(
        suppressWarnings(
            library(pkg, character.only = TRUE)
        )
    )
}

quiet_library("grid")
quiet_library("ggh4x")
quiet_library("ggplot2")
quiet_library("ggprism")
quiet_library("gground")
quiet_library("ggforce")
quiet_library("ggpubr")
quiet_library("ggtext")
quiet_library("stringr")
quiet_library("ggrepel")
quiet_library("ggnewscale")
quiet_library("geomtextpath")

# -----------------------------
# 工具函数：递归构建函数调用
# -----------------------------
build_call <- function(cfg) {
    # NULL ---------------------------------------------------------
    if (is.null(cfg)) {
        return(NULL)
    }

    if (length(class(cfg)) != 1 || class(cfg) != "list") {
        return(cfg)
    }
    # 原子值（数字、字符、逻辑值）---------------------------------
    if (is.atomic(cfg) && !is.list(cfg)) {
        return(cfg)
    }

    # list of lists: 处理 JSON 数组 [{...}, {...}] -----------------
    # 注意：也必须排除带 type 的构造型 list
    if (is.list(cfg) &&
        is.null(cfg$type) &&
        all(vapply(cfg, is.list, logical(1)))) {
        return(lapply(cfg, build_call)) # 递归解析每个元素
    }

    # 普通 list（但不是构造调用）------------------------------------
    if (is.list(cfg) && is.null(cfg$type)) {
        return(lapply(cfg, build_call))
    }

    # 识别构造调用 {"type": "...", "arguments": {...}} -------------
    if (is.list(cfg) && !is.null(cfg$type)) {
        fn <- get(cfg$type, mode = "function", inherits = TRUE)
        args <- lapply(cfg$arguments %||% list(), build_call)
        return(do.call(fn, args))
    }

    # 其他情况保持原状 ---------------------------------------------
    return(cfg)
}
# -----------------------------
# 工具函数：构建 layer
# -----------------------------
build_layer <- function(layer) {
    if (length(class(layer)) > 1 || class(layer) != "list") {
        return(layer)
    }

    geom_func <- get(layer$type)

    params <- lapply(layer$arguments %||% list(), build_call)

    # 子 mapping
    if (!is.null(layer$mapping)) {
        params$mapping <- build_aes(layer$mapping)
    }

    do.call(geom_func, params)
}
# -----------------------------
# 工具函数：构建 aes() 映射
# -----------------------------

# 判断一个字符串是不是纯变量名（合法 R 符号）
is_simple_name <- function(x) {
    is.character(x) &&
        grepl("^[A-Za-z.][A-Za-z0-9._]*$", x)
}

# 自动包装非法列名
wrap_if_needed <- function(x) {
    if (is_simple_name(x)) x else paste0("`", x, "`")
}

# 主函数：构建 aes()
build_aes <- function(mapping_list) {
    if (is.null(mapping_list)) {
        return(NULL)
    }

    aes_args <- lapply(mapping_list, function(x) {
        ### 1. 字符串处理
        if (is.character(x)) {
            x <- gsub("\\s+", "", x)
            # 情况 1：简单列名 → 转换为 symbol
            if (is_simple_name(x)) {
                return(sym(x))
            }

            # 情况 2：表达式（包含括号或运算符） → parse
            if (grepl("[()*/+\\-]", x)) {
                # 若包含非法列名，自动加反引号
                x2 <- stringr::str_replace_all(
                    x, "([A-Za-z.][A-Za-z0-9._ ]*)",
                    wrap_if_needed
                )
                return(parse_expr(x2))
            }

            # 情况 3：非法列名但没有函数 → symbol(`col name`)
            return(sym(wrap_if_needed(x)))
        }

        ### 2. 已经是表达式的情况
        if (is.expression(x) || is.call(x)) {
            return(x)
        }

        ### 3. 其他数值 / TRUE / FALSE 保留
        return(x)
    })

    do.call(aes, aes_args)
}

split_list_by_index <- function(lst, idx) {
    idx <- sort(unique(idx))
    n <- length(lst)

    starts <- c(1, idx + 1)
    ends <- c(idx, n)

    blocks <- Map(function(s, e) lst[s:e], starts, ends)
    return(blocks)
}
# -----------------------------
# 主函数：build_ggplot
# -----------------------------
build_ggplot <- function(cfg, data, p = NULL) {
    # 1) base ggplot
    if (is.null(p)) {
        p <- ggplot(data, mapping = build_aes(cfg$mapping))
    }

    # ------------------------------------------------------------------
    # 2) layers（可以包含嵌套函数，如 position_jitter）
    # ------------------------------------------------------------------
    new_index <- tryCatch(
        {
            which(sapply(
                cfg$scales %||% list(),
                function(x) startsWith(x$type, "new_scale")
            ))
        },
        error = function(e) {
            integer(0)
        }
    )
    if (length(new_index) > 0) {
        layer_index <- unlist(lapply(
            cfg$scales[new_index],
            function(x) x$layer
        ))
        new_index <- new_index[!duplicated(layer_index, fromLast = TRUE)]
        layer_list <- split_list_by_index(cfg$layer, unique(layer_index))
        scale_list <- split_list_by_index(cfg$scales, new_index)
        if (length(layer_list) != length(scale_list)) {
            stop("new_scale error!")
        }
        for (i in seq_len(length(layer_list))) {
            for (layer in layer_list[[i]]) {
                p <- p + build_layer(layer)
            }
            for (s in scale_list[[i]] %||% list()) {
                p <- p + build_call(s)
            }
        }
    } else {
        for (layer in cfg$layers) {
            p <- p + build_layer(layer)
        }
        for (s in cfg$scales %||% list()) {
            p <- p + build_call(s)
        }
    }

    # ------------------------------------------------------------------
    # 4) coordinates
    # ------------------------------------------------------------------
    if (!is.null(cfg$coordinates)) {
        p <- p + build_call(cfg$coordinates)
    }

    # ------------------------------------------------------------------
    # 5) facets
    # ------------------------------------------------------------------
    if (!is.null(cfg$facets)) {
        if (cfg$facets$type == "facet_wrap2") {
            p <- p + build_call(cfg$facets)
        } else {
            facet_func <- get(cfg$facets$type)
            params <- cfg$facets$arguments %||% list()
            # 处理 facets 或 rows/cols 的映射
            if (!is.null(params$facets)) {
                params$facets <- sapply(params$facets, as.name)
            }
            if (!is.null(params$rows)) {
                if (grepl("~", params$rows)) {
                    params$rows <- as.formula(params$rows)
                } else {
                    params$rows <- sapply(params$rows, as.name)
                }
            }
            if (!is.null(params$cols)) {
                if (grepl("~", params$cols)) {
                    params$cols <- as.formula(params$cols)
                } else {
                    params$cols <- sapply(params$cols, as.name)
                }
            }
            p <- p + do.call(facet_func, params %||% list())
        }
    }

    # ------------------------------------------------------------------
    # 6) guides
    # ------------------------------------------------------------------
    if (!is.null(cfg$guides)) {
        p <- p + do.call(guides, lapply(cfg$guides, build_call))
    }

    # ------------------------------------------------------------------
    # 7) labs + lims
    # ------------------------------------------------------------------
    if (!is.null(cfg$labs)) {
        p <- p + build_call(cfg$labs)
    }

    if (!is.null(cfg$lims)) {
        p <- p + build_call(cfg$lims)
    }
    # ------------------------------------------------------------------
    # 8) themes（支持 element_* 和主题函数）
    # ------------------------------------------------------------------
    for (t in cfg$themes %||% list()) {
        # 普通 theme_xxx()
        if (startsWith(t$type, "theme_")) {
            theme_func <- get(t$type)
            p <- p + theme_func()
        } else {
            p <- p + build_call(t)
        }
    }

    return(p)
}


get_index_or_stop <- function(features, equal = NULL, start = NULL) {
    index <- NULL
    if (!is.null(equal)) {
        index <- which(sapply(features, function(x) {
            !is.null(x$type) && x$type == equal
        }))
    }
    if (!is.null(start)) {
        index <- which(sapply(features, function(x) {
            !is.null(x$type) && startsWith(x$type, start)
        }))
    }
    if (is.null(index) | length(index) < 1) {
        stop("layer not found!")
    } else {
        return(index)
    }
}
