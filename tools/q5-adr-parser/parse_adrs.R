#!/usr/bin/env Rscript
args <- commandArgs(trailingOnly = TRUE)
input <- if (length(args) >= 1) args[[1]] else "ADR_REGISTRY.txt"
output <- if (length(args) >= 2) args[[2]] else "adr_manifest.json"
janet_file <- if (length(args) >= 3) args[[3]] else "golden_adr.janet"
if (!file.exists(input)) stop("Missing ADR registry: ", input)
if (!file.exists(janet_file)) stop("Missing Janet parser: ", janet_file)
janet <- Sys.which("janet")
if (!nzchar(janet)) stop("Janet executable not found on PATH")
status <- system2(janet, c(janet_file, input, output), stdout = TRUE, stderr = TRUE)
cat(paste(status, collapse = "\n"), "\n")
if (!file.exists(output)) stop("Janet completed without producing: ", output)
lines <- trimws(readLines(input, warn = FALSE))
id_positions <- which(grepl("^ADR-", lines))
records <- lapply(seq_along(id_positions), function(i) {
  start <- id_positions[[i]]
  stop_at <- if (i < length(id_positions)) id_positions[[i + 1]] - 1 else length(lines)
  body <- paste(lines[(start + 1):stop_at], collapse = " ")
  parts <- strsplit(body, "—", fixed = TRUE)[[1]]
  title <- trimws(parts[[1]])
  description <- if (length(parts) > 1) trimws(paste(parts[-1], collapse = "—")) else ""
  status <- if (grepl("OPEN_CRUX", body, fixed = TRUE)) "OPEN_CRUX" else
    if (grepl("SILENCE_PENDING", body, fixed = TRUE)) "SILENCE_PENDING" else
    if (grepl("PROVEN_NO_SORRY", body, fixed = TRUE)) "PROVEN_NO_SORRY" else
    if (grepl("SPECIFIED", body, fixed = TRUE)) "SPECIFIED" else
    if (grepl("no sorry", body, ignore.case = TRUE)) "PROVEN_NO_SORRY" else
    if (grepl("crux stays none", body, ignore.case = TRUE)) "OPEN_CRUX" else "SPECIFIED"
  data.frame(id = lines[[start]], title = title, status = status, description = description, stringsAsFactors = FALSE)
})
index <- do.call(rbind, records)
csv_out <- sub("\\.json$", "_index.csv", output)
write.csv(index, csv_out, row.names = FALSE)
cat("R index written:", csv_out, "\n")
print(table(index$status))
