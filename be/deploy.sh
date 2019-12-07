set -e;
npm run build;
pm2 start ./dist --node-args "-r module-alias/register";