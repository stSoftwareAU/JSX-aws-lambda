rm -rf node_modules
rm -f /tmp/upload.zip
npm install 

zip /tmp/upload.zip -r \
    --symlinks \
    index.js node_modules/ package.json package-lock.json webpack.config.js \
    --exclude \*/.cache* \*.md \*LICENSE \*/jest\*

ls -lh /tmp/upload.zip
