FROM node:20

WORKDIR /app

COPY ./package*.json .

RUN npm install

COPY . .

EXPOSE 5000

# Start the app
CMD ["npm", "run", "dev"]

# use this if app keeps crashing and you need to enter the docker container to inspect
# ENTRYPOINT ["tail", "-f", "/dev/null"]

# modify when deploying ## CMD ["node", "index.js"]
# add when deploying ## ENV NODE_ENV=production
