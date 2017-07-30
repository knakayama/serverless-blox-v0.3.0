#!/usr/bin/env bash

set -eo pipefail

aws_region="ap-northeast-1"

while getopts ":bc:" args; do
  case "$args" in
    b)
      build=true
      ;;
    c)
      cmd="$OPTARG"
      ;;
    *)
      echo "Invalid args: $OPTARG"
      exit 1
  esac
done

[[ "$build" == true ]] && docker image build --tag sls-blox .

docker container run \
  --tty \
  --rm \
  --volume ${PWD}/.serverless:/serverless/.serverless \
  --env AWS_ACCESS_KEY_ID="$(aws configure get aws_access_key_id)" \
  --env AWS_SECRET_ACCESS_KEY="$(aws configure get aws_secret_access_key)" \
  --env AWS_REGION="$aws_region" \
  sls-blox \
  run "$cmd"
