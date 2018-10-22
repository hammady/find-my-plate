FROM node:8
LABEL maintainer="Hossam Hammady <github@hammady.net>"
WORKDIR /app

COPY package*.json /app/
RUN npm install

COPY wait-for-it.sh /app/
COPY entry-point.sh /app/
COPY src/ /app/

EXPOSE 3000
CMD [ "npm", "start" ]
