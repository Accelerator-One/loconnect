# Docker Configuration for Application
FROM node:lts
WORKDIR /usr/src/app

# Basic patches (optional)
RUN apt-get update
RUN apt-get install -y apt-transport-https 

# Tensorflow dependencies
RUN apt-get install -y g++

# Add your App to container
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Expose your Development PORT
EXPOSE 8080
CMD [ "node", "index.js" ]
