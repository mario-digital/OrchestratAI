#!/bin/bash

# Run vitest coverage and capture output
output=$(vitest run --coverage --reporter=verbose 2>&1)
exit_code=$?

# Display the full output
echo "$output"

# Extract coverage percentages from "All files" line
coverage_line=$(echo "$output" | grep "All files")

if [ -n "$coverage_line" ]; then
    # Parse the coverage values (statements, branches, functions, lines)
    # Use sed to remove the | characters and extra spaces first
    clean_line=$(echo "$coverage_line" | sed 's/|/ /g' | tr -s ' ')
    stmts=$(echo "$clean_line" | awk '{print $3}')
    branch=$(echo "$clean_line" | awk '{print $4}')
    funcs=$(echo "$clean_line" | awk '{print $5}')
    lines=$(echo "$clean_line" | awk '{print $6}')

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📊 Coverage Threshold Validation (Required: 80%)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    # Check lines
    if (( $(echo "$lines >= 80" | bc -l) )); then
        echo "✅ Lines:      $lines% meets threshold (80%)"
    else
        echo "❌ Lines:      $lines% BELOW threshold (80%)"
    fi

    # Check statements
    if (( $(echo "$stmts >= 80" | bc -l) )); then
        echo "✅ Statements: $stmts% meets threshold (80%)"
    else
        echo "❌ Statements: $stmts% BELOW threshold (80%)"
    fi

    # Check branches
    if (( $(echo "$branch >= 80" | bc -l) )); then
        echo "✅ Branches:   $branch% meets threshold (80%)"
    else
        echo "❌ Branches:   $branch% BELOW threshold (80%)"
    fi

    # Check functions
    if (( $(echo "$funcs >= 80" | bc -l) )); then
        echo "✅ Functions:  $funcs% meets threshold (80%)"
    else
        echo "❌ Functions:  $funcs% BELOW threshold (80%)"
    fi

    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

    if [ $exit_code -eq 0 ]; then
        echo "✅ All coverage thresholds passed!"
    else
        echo "❌ Some coverage thresholds failed!"
    fi
    echo ""
fi

exit $exit_code
