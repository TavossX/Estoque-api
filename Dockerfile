# Use uma imagem base do Node.js
FROM node:18-alpine

# Defina o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências do projeto
RUN npm install

# Copie o restante do código da sua aplicação
COPY . .

# Exponha a porta que sua API utiliza (no seu caso, a porta 5000)
EXPOSE 5000

# Comando para iniciar sua aplicação
CMD [ "npm", "start" ]