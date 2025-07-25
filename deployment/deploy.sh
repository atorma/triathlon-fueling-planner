#! /bin/sh
set -e

cd "$(dirname "$0")"

. utils.sh
. .env.build

cd k8s

kustomize edit set image trifueling-image="$GCLOUD_REPOSITORY/trifueling:$(get_commit_hash)"
kubectl apply -k .
git restore kustomization.yaml