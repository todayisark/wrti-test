cd /root/projects/wrti-test
git pull origin dev
npm run build
pm2 restart wrti
