# Cheatsheet

## pm2

| Command                                   | Description                 |
| ----------------------------------------- | --------------------------- |
| pm2 start npm --name "mesibot" -- run dev | Run npm run dev with PM2    |
| pm2 start npm --name "mesibot" -- start   | Run production mode         |
| pm2 save && pm2 startup                   | Auto-start app after reboot |
| pm2 logs mesibot                          | View logs                   |
| pm2 restart mesibot                       | Restart app                 |
| pm2 stop mesibot                          | Stop app                    |
| pm2 list                                  | List all running apps       |
| pm2 delete mesibot                        | Delete app                  |
| pm2 save                                  | Save current state          |
| pm2 restart all                           | Restart all apps            |
