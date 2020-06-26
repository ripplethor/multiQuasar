cd apps
for FILE in *; do
    if [ -d "$FILE" ]; then
        if [[ "$FILE" != "."* ]]; then
            cd "$FILE"
                quasar build -m ssr
            cd ..
        fi

    fi
done
cd ..