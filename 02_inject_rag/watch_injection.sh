#!/bin/bash

# Calculate total documents to inject from JSONL files
TOTAL=$(cat 01_extract_content/output/*.jsonl 2>/dev/null | wc -l)

if [ "$TOTAL" -eq 0 ]; then
    echo "No documents found in 01_extract_content/output/*.jsonl"
    exit 1
fi

# Store start timestamp
START_TIME=$(date +%s)

echo "Total documents to inject: $TOTAL"
echo "Started at: $(date)"
echo ""

watch -t -n 5 --color "
  NOW=\$(date +%s)
  ELAPSED=\$((NOW - $START_TIME))
  curl -X POST http://localhost:6333/collections/law_library/points/count \
    -H 'Content-Type: application/json' \
    -d '{}' -s | jq -C -r --arg total $TOTAL --arg elapsed \$ELAPSED '
    .result.count as \$count |
    (\$count / (\$total | tonumber)) as \$ratio |
    (if \$ratio > 1 then 1 else \$ratio end) as \$clamped_ratio |
    (\$clamped_ratio * 100 | floor) as \$perc |
    (20 * \$clamped_ratio | floor) as \$filled |
    (if \$perc >= 100 then \"COMPLETE\" else \"INDEXING\" end) as \$status |
    (\$elapsed | tonumber) as \$secs |
    (if \$secs > 0 then (\$count / \$secs) else 0 end) as \$speed |
    (\$secs / 60 | floor) as \$mins |
    (\$secs % 60) as \$remaining_secs |
    (if \$speed > 0 and \$count < (\$total | tonumber) then (((\$total | tonumber) - \$count) / \$speed / 60 | floor) else 0 end) as \$eta_mins |
    \"\u001b[32mStatus: [\(\$status)]\",
    \"Count:  \(\$count) / \(\$total)\",
    \"[\( (\"#\" * \$filled) + (\"-\" * (20 - \$filled)) )] \(\$perc)%\",
    \"\",
    \"Elapsed: \(\$mins)m \(\$remaining_secs)s\",
    \"Speed:   \(\$speed | floor) docs/sec\",
    \"ETA:     ~\(\$eta_mins) min\u001b[0m\"'"