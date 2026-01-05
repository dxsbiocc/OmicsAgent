quiet_library <- function(pkg) {
    suppressPackageStartupMessages(
        suppressWarnings(
            library(pkg, character.only = TRUE)
        )
    )
}

quiet_library("tidyverse")
quiet_library("jsonlite")
quiet_library("circlize")
quiet_library("ComplexHeatmap")

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

transform_matrix <- function(mat, trans) {
    rowname_col <- trans$rownames %||% "rownames" %||% "sample_name" %||% "sample" # nolint: line_length_linter.
    mat <- mat %>%
        tibble::column_to_rownames(rowname_col) %>%
        as.matrix()

    if (!is.null(trans$log2)) {
        mat <- log2(mat + trans$log2_offset %||% 1)
    }
    if (!is.null(trans$scale)) {
        if (is.null(trans$arguments$row) && isTRUE(trans$scale$arguments$row)) {
            trans$scale$arguments$x <- t(mat)
            mat <- t(do.call(scale, trans$scale$arguments))
            dimnames(mat) <- dimnames(trans$scale$arguments$x)
        } else {
            trans$scale$arguments$x <- mat
            mat <- do.call(scale, trans$scale$arguments)
        }
    }

    if (is.null(trans$split)) {
        mat <- list(mat)
    } else {
        if (!is.null(trans$split$row)) {
            mat <- split(mat, trans$split$row)
        }
        if (!is.null(trans$split$col)) {
            mat <- split(mat, trans$split$row)
        }
    }
    return(mat)
}

build_heatmap <- function(cfg, data) {
    ht_list <- list()
    for (i in seq_along(cfg$heatmap)) {
        ht <- cfg$heatmap[[i]]
        ht$arguments$matrix <- data[[i]]
        ht_list[[i]] <- build_call(ht)
    }

    if (cfg$draw$order == "h") {
        return(Reduce(`%v%`, ht_list))
    } else if (cfg$draw$order == "v") {
        return(Reduce(`+`, ht_list))
    } else {
        stop("not support")
    }
}
