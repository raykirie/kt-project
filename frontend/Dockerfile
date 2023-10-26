# frontend/Dockerfile

# Используйте официальный образ Node.js для создания приложения
FROM node:14

# Установите рабочую директорию
WORKDIR /app

# Копируйте файлы package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Установите зависимости
RUN npm install

# Копируйте оставшиеся файлы и папки
COPY . .

# Соберите React-приложение
RUN npm run build

# Открыть порт 3000
EXPOSE 3000

# Запустите сервер
CMD [ "npm", "start" ]
