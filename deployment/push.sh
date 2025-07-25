#! /bin/sh
set -e

cd "$(dirname "$0")"

. utils.sh
. .env.build

docker push "$GCLOUD_REPOSITORY"/trifueling:"$(get_commit_hash)"