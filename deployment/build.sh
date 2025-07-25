#! /bin/sh
set -e
cd "$(dirname "$0")"

. utils.sh
. .env.build

npm run build

docker build -f ../Dockerfile -t trifueling -t "$GCLOUD_REPOSITORY"/trifueling:"$(get_commit_hash)" ../