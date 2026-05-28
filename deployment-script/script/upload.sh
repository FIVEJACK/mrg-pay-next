#!/bin/bash
DIR_LOCATION="${1:-./}"

echo "Prepare to upload static source to S3"
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs -d '\n')
fi

if [ -z "$S3_ACCESS_KEY_ID" ] && [ -z "$S3_SECRET_ACCESS_KEY" ] && [ -z "$S3_REGION" ] && [ -z "$S3_BUCKET" ]; then 
  echo "S3 env is blank, skipping upload"; 
else 
  cd $DIR_LOCATION

  if ! [ -x "$(command -v aws)" ]; then
    echo "aws command not found, installing aws"
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
  fi

  echo "Setting up AWS Credential"
  aws configure set aws_access_key_id $S3_ACCESS_KEY_ID
  aws configure set aws_secret_access_key $S3_SECRET_ACCESS_KEY
  aws configure set region $S3_REGION
  UPLOAD_PATH="s3://$S3_BUCKET/$S3_UPLOAD_FOLDER/_next/static"

  echo "Upload static file to bucket $S3_BUCKET"
  aws s3 cp ".next/static" "$UPLOAD_PATH" --recursive --exclude "*.map"
fi