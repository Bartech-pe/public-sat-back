# Init development comands

```
npm install
npx sequelize-cli db:drop --env development --debug
npx sequelize-cli db:create --env development --debug
npx sequelize-cli db:migrate --env development --debug
npx sequelize-cli db:seed:all --env development --debug
```

# Init production

```
npm install
npx sequelize-cli db:drop --env production --debug
npx sequelize-cli db:create --env production --debug
npx sequelize-cli db:migrate --env production --debug
npx sequelize-cli db:seed:all --env production --debug
```

# Init central vicidial (temporal)

```
npm install
npx sequelize-cli db:drop --env central --debug
npx sequelize-cli db:create --env central --debug
```