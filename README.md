# CD Player

This guide walks you through running CD Player on your own computer. You don't need any programming experience. Everything the app needs runs inside Docker, a free program that runs apps in self-contained "containers", so you won't need to install anything else.

Setting it up for the first time takes about 15 minutes, most of it waiting for downloads. After that, starting the app takes a few seconds.

---

## 1. Install Docker Desktop (one time only)

1. Go to <https://www.docker.com/products/docker-desktop/> and download Docker Desktop for your computer.
   - **Mac:** click the Apple menu › **About This Mac**. If the "Chip" line says "Apple M…", download the "Apple Silicon" version; otherwise download the "Intel chip" version.
   - **Windows:** Docker Desktop will ask to install **WSL 2**. Say yes and restart when prompted. (Windows users should also read [the Windows note](#windows-users) below.)
2. Install it like any other app and open it.
3. Wait until Docker Desktop says **"Engine running"** (bottom-left corner of its window).

Docker Desktop must be open whenever you want to use CD Player.

## 2. Get the project folder

Put the `cd-player` folder somewhere easy to find, for example your home folder. If you were sent a `.zip` file, double-click it to unzip it first.

## 3. Open a terminal in the project folder

A terminal is a window where you type commands. Every command in this guide is typed there, followed by the **Return/Enter** key.

- **Mac:** open the **Terminal** app (press ⌘ + Space, type `Terminal`, press Return). Type `cd ` (with a space after it), drag the `cd-player` folder from Finder into the Terminal window, then press Return.
- **Windows:** open **Ubuntu** from the Start menu (it was installed with WSL), then `cd` into the folder as described in [the Windows note](#windows-users).

To check you're in the right place, type:

```shell
ls
```

You should see names such as `compose.yml`, `README.md` and `artisan`. If not, repeat the `cd` step.

## 4. First-time setup

Copy and paste each command below into the terminal, one at a time, and press Return after each. Wait for one to finish (the cursor comes back) before running the next.

**a. Create the settings file**

```shell
cp .env.example .env
```

Nothing is printed. That's normal.

**b. Download the app's building blocks**

```shell
docker run --rm -u "$(id -u):$(id -g)" -v "$(pwd):/app" -w /app composer:2 composer install --ignore-platform-reqs
```

This takes a minute or two and prints a lot of text. It is finished when you see the cursor again.

**c. Start the app**

```shell
./vendor/bin/sail up -d
```

The **first time**, this builds the app's container and can take **5–10 minutes**. Later starts take seconds. When it finishes you'll see several lines ending in `Started`.

## 5. Open the app

Wait about 20 seconds after step 4c, then open your web browser and go to:

**<http://localhost:8000>**

Click **Register** to create an account. The account only exists on your computer.

---

## Everyday use

Always open a terminal in the project folder first (step 3).

| To… | Type |
| --- | --- |
| Start the app | `./vendor/bin/sail up -d` |
| Stop the app | `./vendor/bin/sail down` |
| Check it's running | `./vendor/bin/sail ps` |

Stopping the app does not delete your data. When you're done for the day you can stop the app and quit Docker Desktop.

---

## Troubleshooting

**"Cannot connect to the Docker daemon" or "docker: command not found"**
Docker Desktop isn't running. Open it, wait for "Engine running", and try again.

**"port is already allocated" or "address already in use"**
Another program is already using port 8000 or 5173. Open the `.env` file in a text editor (TextEdit on Mac, Notepad on Windows) and change these three lines near the top to unused numbers, for example:

```
APP_URL=http://localhost:8001
APP_PORT=8001
VITE_PORT=5174
```

Save the file, run `./vendor/bin/sail down`, then `./vendor/bin/sail up -d`, and use the new address (here <http://localhost:8001>).

> On a Mac, `.env` is hidden in Finder. Press ⌘ + Shift + . (period) to show hidden files.

**The page won't load, is blank, or shows an error about "Vite"**
The app may still be starting. Wait 30 seconds and refresh. If it still fails, run:

```shell
./vendor/bin/sail ps
```

All of `app`, `vite`, `queue` and `logs` should say `Up`. If one doesn't, restart everything with `./vendor/bin/sail down` followed by `./vendor/bin/sail up -d`.

**"./vendor/bin/sail: No such file or directory"**
Either you're not in the project folder (see step 3) or step 4b hasn't been run yet.

**Still stuck?**
Run the command below and send the output to the developer:

```shell
./vendor/bin/sail logs --tail 50
```

---

## Starting over from scratch

This deletes everything you've created in the app, including accounts:

```shell
./vendor/bin/sail down -v
rm database/database.sqlite
./vendor/bin/sail up -d
```

---

## Windows users

On Windows, the app must run inside WSL (the Linux environment installed with Docker Desktop), not from a normal Windows folder, or it will be very slow.

1. Open **Ubuntu** from the Start menu. The first time, it asks you to choose a username and password.
2. In Docker Desktop, go to **Settings › Resources › WSL Integration** and switch on **Ubuntu**.
3. Copy the project into your Ubuntu home folder. In File Explorer, go to `\\wsl$\Ubuntu\home\<your-username>` and paste the `cd-player` folder there.
4. In the Ubuntu window, type `cd ~/cd-player` and continue from step 3's `ls` check.

---

## For developers

The app is Laravel 13 with the React + Inertia starter kit, running on [Laravel Sail](https://laravel.com/docs/sail). `compose.yml` defines five services:

- **`setup`:** a one-off step that installs dependencies, creates `.env` and the SQLite database, and runs migrations.
- **`app`:** the web server.
- **`vite`:** the frontend dev server.
- **`queue`:** the queue worker.
- **`logs`:** `pail`, which streams the app's logs.

`APP_SERVICE=app` in `.env` points `sail` commands at the `app` service.
