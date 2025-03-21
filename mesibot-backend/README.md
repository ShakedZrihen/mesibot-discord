# MesiBot

## Discord bot

### Steps to Run

1. go to discord [developer portal](https://discord.com/developers/applications) and create Discord Bot Token

2. generate token under "bot" tab

3. create .env file with the following

```.env
DISCORD_APP_ID=<app_id>
DISCORD_TOKEN=<generated_token>
```

## managing the server

npm install -g pm2

start

```bash
pm2 start npm --name "mesibot-dev" -- run dev
```

list

```bash
pm2 list
```

logs

```bash
pm2 logs mesibot-dev
```

stop

```bash
pm2 stop mesibot-dev
```
