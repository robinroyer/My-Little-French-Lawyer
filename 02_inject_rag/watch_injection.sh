#!/bin/bash

# Calculate total documents to inject from JSONL files
TOTAL=$(cat 01_extract_content/output/*.jsonl 2>/dev/null | wc -l)

if [ "$TOTAL" -eq 0 ]; then
    echo "No documents found in 01_extract_content/output/*.jsonl"
    exit 1
fi

echo "Total documents to inject: $TOTAL"
echo ""

watch -t -d -n 5 --color "curl -X POST http://localhost:6333/collections/law_library/points/count \
  -H 'Content-Type: application/json' \
  -d '{}' -s | jq -C -r --arg total $TOTAL '
  .result.count |
  (. / (\$total | tonumber)) as \$ratio |
  (if \$ratio > 1 then 1 else \$ratio end) as \$clamped_ratio |
  (\$clamped_ratio * 100 | floor) as \$perc |
  (20 * \$clamped_ratio | floor) as \$filled |
  (if \$perc >= 100 then \"COMPLETE\" else \"INDEXING\" end) as \$status |
  \"Status: [\(\$status)]\",
  \"Count:  \(.) / \(\$total)\",
  \"[\( (\"#\" * \$filled) + (\"-\" * (20 - \$filled)) )] \(\$perc)%\"'"