#!/bin/bash

# Simple script to run the generate_kidnews.js script manually
# This is useful for testing that the script works correctly
# before setting up automated execution

# Change to the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "==================================="
echo "WonderLens Daily News Generator"
echo "==================================="
echo "Generating fresh news content..."
echo

# Run the script
node generate_kidnews.js

echo
echo "Done! Check the Supabase database to verify the news was generated."
echo "===================================" 