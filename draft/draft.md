

npm init
npx tsc --init


npx prisma init --datasource-provider sqlite
npx prisma migrate dev --name myMigrationInit
DATABASE_URL="file:./DB/user.db"

npx prisma generate

# delete and reset db

npx prisma migrate reset
rm -rf prisma/migrations
npx prisma migrate dev --name init


