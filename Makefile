APIKEY ?= 
STACK_NAME ?= news-api-automation

build:
	sam build --use-container

deploy:
	sam deploy --template-file template.yaml --stack-name ${STACK_NAME} --parameter-overrides "APIKEY=${APIKEY}"

destroy:
	sam delete --stack-name ${STACK_NAME}