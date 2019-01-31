FROM node:alpine
MAINTAINER Enrique Gonzalez <enriikke@gmail.com>

LABEL "com.github.actions.name"="Gatsby Publish"
LABEL "com.github.actions.description"="Build and deploy your Gatsby site to GitHub Pages."
LABEL "com.github.actions.icon"="book-open"
LABEL "com.github.actions.color"="purple"

RUN	apk add --no-cache bash ca-certificates git && npm install --global gatsby-cli

COPY entrypoint /entrypoint
COPY entrypoint /usr/bin/entrypoint

ENTRYPOINT ["entrypoint"]
