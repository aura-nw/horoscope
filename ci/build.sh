#!/bin/sh
set -xe

#Login to registry
echo $GITHUB_PASSWORD | docker login ghcr.io -u $GITHUB_USERNAME --password-stdin
#Build and push image
docker build -t ${CONTAINER_RELEASE_IMAGE} --build-arg NPM_TOKEN=$NPM_TOKEN -f Dockerfile .
docker push ${CONTAINER_RELEASE_IMAGE}