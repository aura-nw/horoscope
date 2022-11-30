#!/bin/sh
set -xe

#Login to registry
echo $GITHUB_PASSWORD | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
#Build and push image
CONTAINER_RELEASE_NAME=ghcr.io/aura-nw/aura-indexer-crawl:feature-crawl-for-cosmoshub2_${SHORT_SHA_COMMIT}

docker build -t ${CONTAINER_RELEASE_NAME} -f Dockerfile .
docker push ${CONTAINER_RELEASE_NAME}