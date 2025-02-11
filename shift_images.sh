#!/bin/bash

# Set path to the specific folder
INPUT_PATH="public/spritesheets/torso/clothes/longsleeve/longsleeve/male/idle"
OUTPUT_PATH="$INPUT_PATH/shifted"

# Create output directory if it doesn't exist
mkdir -p "$OUTPUT_PATH"

# Process each PNG in the input directory
for img in "$INPUT_PATH"/*.png; do
    filename=$(basename "$img")
    convert "$img" -background transparent -gravity south -splice 0x1 -gravity north -chop 0x1 "$OUTPUT_PATH/$filename"
done

echo "Images shifted and saved to $OUTPUT_PATH" 