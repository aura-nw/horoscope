#!/bin/sh
set -xe

#Login to registry
echo $GITHUB_PASSWORD | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
#Build and push image
echo CONTAINER_RELEASE_IMAGE=ghcr.io/aura-nw/aura-indexer-crawl:feature-crawl-for-cosmoshub3_${SHORT_SHA_COMMIT}

docker build -t ${CONTAINER_RELEASE_IMAGE} -f Dockerfile .
docker push ${CONTAINER_RELEASE_IMAGE}