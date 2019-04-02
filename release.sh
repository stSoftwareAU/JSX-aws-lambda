#!/bin/bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
WORK_DIR=`mktemp -d -t wdXXXXXXXX`
RELEASE_DIR=$DIR/build/Release

mkdir -p $RELEASE_DIR
cp lambda_package.json $WORK_DIR/package.json
cp index.js $WORK_DIR/
cp webpack.config.js $WORK_DIR/

cd $WORK_DIR
#npm install npm@latest --save-dev
npm install npm@latest
npm install 
npm install --save-dev @babel/plugin-proposal-class-properties
rm -f $RELEASE_DIR/lambda.zip
#zip $RELEASE_DIR/lambda.zip index.js package.json webpack.config.js

zip $RELEASE_DIR/lambda.zip -r \
    --symlinks \
    index.js node_modules/ package.json package-lock.json webpack.config.js \
    --exclude \*/.cache* \*/html \*/test \*.md \*LICENSE \*/jest\*

ls -lh $RELEASE_DIR/lambda.zip

rm -rf $WORK_DIR
