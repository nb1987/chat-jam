FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install
RUN npm install -g nodemon

COPY . .

EXPOSE 5000 9229

# Start the app
CMD ["npm", "run", "dev"]
# modify when deploying ## CMD ["node", "index.js"]
# add when deploying ## ENV NODE_ENV=production
