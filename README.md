# Personal Daily Planner

DAPL is a multilingual personal daily planner for managing tasks, routines, priorities, calendars, backups, user profiles, and notifications.

The application follows a local-first approach:

- Planner data remains usable without registration.
- Tasks, routines, settings, and backups are stored locally with IndexedDB.
- Registration is optional.
- Registered users can store their account and profile information in MySQL.
- Signed-in users can register their devices for Web Push notifications.

## Current Project Status

The project currently includes:

- Next.js frontend and server API routes
- IndexedDB as the primary local planner database
- JSON backup and restore
- Automatic local backups
- Optional backup-directory selection
- Better Auth authentication
- MySQL and Prisma persistence for accounts and profiles
- Web Push subscriptions
- PWA installation for desktop and mobile
- Service Worker support
- English, German, Persian, and Arabic interfaces

Planner tasks and routines are currently local to each device. Signing in does not yet synchronize planner data between devices.

## Features

### Planner

- Daily task planning
- Task creation, editing, deletion, and completion
- Normal, important, and essential priorities
- Task prerequisite support
- Carry-over tasks
- Task filtering and progress tracking
- Calendar-based task display
- Gregorian, Jalali, and Hijri calendars
- Current-day and task-priority indicators

### Routines

- Reusable daily and weekly routines
- Routine activation and deactivation
- Routine descriptions
- Repeat-day selection
- Optional time or all-day scheduling
- Applying routines to the current day
- Duplicate-task prevention

### Local Storage and Backup

- IndexedDB as the primary planner database
- Migration from legacy `localStorage`
- Manual JSON backup
- JSON restore
- Automatic daily backups
- Backup retention
- Optional external backup directory where supported
- Missing IndexedDB-record detection
- Guided backup recovery

### Accounts and Profiles

- Optional registration
- Email and password login
- Secure password hashing through Better Auth
- Persistent sessions
- Editable first name, last name, and timezone
- MySQL persistence with Prisma
- Guest access without registration

### Notifications

- Browser notification permission handling
- Local test notifications
- Web Push subscriptions for signed-in users
- Server-delivered test notifications
- Push-subscription removal
- Notification-click navigation to the application
- PWA notification support on compatible mobile devices

Scheduled task reminders are not connected yet. The current implementation provides the complete permission, subscription, storage, delivery, and test flow.

### PWA

- Web App Manifest
- Service Worker registration
- Desktop installation
- Android installation
- iOS Home Screen installation guide
- PWA icons in 192×192 and 512×512 sizes
- Standalone display mode
- Notification support in the installed application

## Supported Languages

- English — default
- German
- Persian
- Arabic

The document language and direction automatically switch between LTR and RTL.

Default calendar behavior is language-aware:

- English and German use Gregorian by default.
- Persian supports Jalali.
- Arabic supports Hijri.

Task dates are stored internally in ISO format. Calendar selection only changes presentation.

## Technology Stack

- Next.js 15
- React 19
- JavaScript
- SCSS
- IndexedDB
- MySQL
- Prisma 7
- Better Auth
- Web Push
- Service Worker
- PWA Web App Manifest

## Main Project Structure

```text
app/
  api/
    auth/
    db-check/
    profile/
    push/
  calendar/
  routines/
  settings/

components/
  calendar/
  layout/
  planner/
  providers/
  pwa/
  routines/
  settings/
  ui/

hooks/
lib/
  server/
locales/
  translations/
prisma/
  migrations/
  schema.prisma
public/
  icons/
  sw.js
styles/
```

## Requirements

Install the following tools before starting:

- Node.js 20.19 or newer
- npm
- MySQL 8 or a compatible MariaDB server
- Git

Check the installed versions:

```bash
node --version
npm --version
mysql --version
```

## Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd dapl
npm install
```

## Quick Start with Docker

Install and start Docker Desktop, or Docker Engine with the Compose plugin.
No separate Node.js or MySQL installation is required.

From the repository root, run:

```bash
bash scripts/dev.sh
```

On Windows, use Git Bash or WSL.

The script builds the application image, generates local authentication
and Web Push keys if missing, and starts MySQL and the application.
Prisma Client generation and existing migrations run automatically
when the application container starts.

Open:

```text
http://localhost:3000
```

In Codespaces, open forwarded port 3000. The setup detects its URL.
For another development URL, set `DEV_APP_URL` before the first setup:

```bash
DEV_APP_URL="https://your-development-host" bash scripts/dev.sh
```

Existing `.env.docker` settings are preserved on subsequent runs.

### Logs and status

```bash
docker compose -f compose.dev.yaml ps -a
docker compose -f compose.dev.yaml logs -f app
```

Wait for Next.js to report `Ready` before opening the application.
Pressing Ctrl+C exits the log view without stopping the containers.

### Stop the environment

```bash
docker compose -f compose.dev.yaml down
```

Database data remains in its Docker volume.
Do not add `-v` unless you intend to delete the development database.

### Inspect the database

```bash
docker compose -f compose.dev.yaml exec db sh -c \
  'MYSQL_PWD="$MYSQL_PASSWORD" mysql -u "$MYSQL_USER" "$MYSQL_DATABASE"'
```

Inside MySQL:

```sql
SHOW TABLES;
SELECT id, name, email FROM users;
SELECT firstName, lastName, timeZone FROM profiles;
EXIT;
```

This environment uses a separate development database.
Accounts from another database are not automatically copied into it.

### Apply source changes

Run the startup script again to rebuild and recreate the application:

```bash
bash scripts/dev.sh
```

Source files are currently copied into the image, so host edits
require rebuilding.

### Configuration

`.env.docker` is generated locally and must not be committed.
The MySQL credentials in `compose.dev.yaml` are for local development only.

### Connection troubleshooting

If MySQL is healthy but the application reports Prisma `P1001`,
check connectivity between containers.

In some Linux environments, stale `iptables-legacy` rules can block
Docker bridge traffic. Our Codespaces environment required a rule
allowing traffic within the project's bridge. This is an environment
repair, not a normal installation step, and may need to be reapplied
after network recreation or host restart.


## MySQL Setup

Start MySQL using the command appropriate for your operating system.

Example on Linux:

```bash
sudo service mysql start
```

Open the MySQL client:

```bash
mysql -u root -p
```

Create the application and shadow databases:

```sql
CREATE DATABASE dapl
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE DATABASE dapl_shadow
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Optionally create a dedicated development user:

```sql
CREATE USER IF NOT EXISTS 'dapl_user'@'%'
IDENTIFIED BY 'replace-with-a-development-password';

GRANT ALL PRIVILEGES ON dapl.* TO 'dapl_user'@'%';
GRANT ALL PRIVILEGES ON dapl_shadow.* TO 'dapl_user'@'%';

FLUSH PRIVILEGES;
EXIT;
```

Do not reuse the example password in a shared or production environment.

## Environment Configuration

Create a `.env` file in the project root:

```dotenv
DATABASE_URL="mysql://dapl_user:replace-with-a-development-password@127.0.0.1:3306/dapl"
SHADOW_DATABASE_URL="mysql://dapl_user:replace-with-a-development-password@127.0.0.1:3306/dapl_shadow"

BETTER_AUTH_URL="http://localhost:3000"
BETTER_AUTH_SECRET="replace-with-a-generated-secret"

AUTH_EXTRA_TRUSTED_ORIGINS="http://127.0.0.1:3000"

NEXT_PUBLIC_VAPID_PUBLIC_KEY="replace-with-public-vapid-key"
VAPID_PRIVATE_KEY="replace-with-private-vapid-key"
VAPID_SUBJECT="mailto:developer@example.com"
```

Never commit `.env`, database passwords, authentication secrets, or the VAPID private key.

### Generate the authentication secret

```bash
openssl rand -base64 32
```

Copy the result into:

```dotenv
BETTER_AUTH_SECRET="generated-value"
```

### Generate VAPID keys

```bash
npx web-push generate-vapid-keys
```

Place the generated public key in:

```dotenv
NEXT_PUBLIC_VAPID_PUBLIC_KEY="generated-public-key"
```

Place the generated private key in:

```dotenv
VAPID_PRIVATE_KEY="generated-private-key"
```

`VAPID_SUBJECT` should contain a valid contact address:

```dotenv
VAPID_SUBJECT="mailto:developer@example.com"
```

## Prisma Setup

Validate the Prisma schema:

```bash
npx prisma validate
```

Generate the Prisma Client:

```bash
npx prisma generate
```

Apply the committed migrations:

```bash
npx prisma migrate deploy
```

Check migration status:

```bash
npx prisma migrate status
```

Developers creating a new schema migration may use:

```bash
npx prisma migrate dev --name describe_the_change
```

Reviewers normally only need `prisma migrate deploy`.

## Development Server

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

To make the server accessible through Codespaces or another forwarded interface:

```bash
npm run dev -- --hostname 0.0.0.0
```

## Production Build

Create a production build:

```bash
npm run build
```

Start the production server:

```bash
npm run start -- --hostname 0.0.0.0
```

Open:

```text
http://localhost:3000
```

Use the production build when performing the final PWA and Service Worker review.

## Useful URLs

| Purpose                    | Local URL                                    |
| -------------------------- | -------------------------------------------- |
| Application                | `http://localhost:3000`                      |
| Settings                   | `http://localhost:3000/settings`             |
| Calendar                   | `http://localhost:3000/calendar`             |
| Routines                   | `http://localhost:3000/routines`             |
| Development database check | `http://localhost:3000/api/db-check`         |
| Web App Manifest           | `http://localhost:3000/manifest.webmanifest` |
| Service Worker             | `http://localhost:3000/sw.js`                |
| Prisma Studio              | `http://localhost:5555`                      |

The database-check endpoint is only available in development mode.

## Codespaces Setup

Start the application:

```bash
npm run dev -- --hostname 0.0.0.0
```

Open the Codespaces **Ports** panel and open port `3000` in the browser.

The forwarded URL normally looks like:

```text
https://<codespace-name>-3000.app.github.dev
```

For Codespaces, update `.env` so `BETTER_AUTH_URL` exactly matches the current forwarded URL:

```dotenv
BETTER_AUTH_URL="https://<codespace-name>-3000.app.github.dev"
AUTH_EXTRA_TRUSTED_ORIGINS="http://localhost:3000,http://127.0.0.1:3000"
```

Restart the application after changing `.env`.

The Codespaces URL is dynamic and must not be permanently hardcoded in the source code.

For mobile testing, open the forwarded HTTPS URL on the mobile device. If port visibility is changed to public, use that setting only temporarily and do not expose production credentials.

## Database Inspection

Start Prisma Studio:

```bash
npx prisma studio
```

Open:

```text
http://localhost:5555
```

The main tables are:

| Table                | Purpose                                       |
| -------------------- | --------------------------------------------- |
| `users`              | Better Auth user records                      |
| `accounts`           | Authentication providers and hashed passwords |
| `sessions`           | Active login sessions                         |
| `verifications`      | Verification tokens                           |
| `profiles`           | First name, last name, and timezone           |
| `push_subscriptions` | Browser Web Push subscriptions                |

Passwords are never stored as readable plain text. Better Auth stores a secure password hash in `accounts.password`. The original password cannot and should not be retrieved from the database.

### Optional MySQL inspection

Open the database:

```bash
mysql -h 127.0.0.1 -P 3306 -u dapl_user -p dapl
```

List the tables:

```sql
SHOW TABLES;
```

Inspect registered users:

```sql
SELECT
  id,
  name,
  email,
  emailVerified,
  createdAt
FROM users;
```

Inspect profiles:

```sql
SELECT
  userId,
  firstName,
  lastName,
  timeZone,
  createdAt,
  updatedAt
FROM profiles;
```

Inspect authentication accounts without exposing full hashes:

```sql
SELECT
  userId,
  providerId,
  LEFT(password, 20) AS passwordHashPreview,
  createdAt
FROM accounts;
```

Inspect Push subscriptions without printing browser endpoints or keys:

```sql
SELECT
  id,
  userId,
  locale,
  createdAt,
  updatedAt
FROM push_subscriptions;
```

Exit MySQL:

```sql
EXIT;
```

## Manual Review Guide

### 1. Guest Mode

1. Open `http://localhost:3000`.
2. Do not create an account.
3. Create a task.
4. Create a routine.
5. Refresh the page.
6. Confirm that tasks and routines remain available.
7. Confirm that the application remains usable without registration.

### 2. IndexedDB

In Chrome:

1. Open Developer Tools.
2. Open **Application**.
3. Open **Storage → IndexedDB**.
4. Select the `dapl` database.
5. Inspect the `records`, `metadata`, and `backups` stores.

Expected behavior:

- Planner and routine data are stored in `records`.
- Initialization information is stored in `metadata`.
- Automatic backup snapshots are stored in `backups`.

Planner data should not be stored in MySQL yet.

### 3. Backup and Restore

1. Open `http://localhost:3000/settings`.
2. Create at least one task and one routine.
3. Select **Download backup**.
4. Confirm that a JSON file is downloaded.
5. Open the JSON file and confirm that it contains planner and routine data.
6. Select **Choose backup file**.
7. Select the downloaded JSON file.
8. Confirm the restore action.
9. Refresh and verify the restored data.

Also review:

- Automatic backup enable/disable
- Automatic backup time
- Latest local automatic backup
- External backup directory on supported Chromium browsers

Directory selection may not be supported by Safari or Firefox because it depends on the File System Access API.

### 4. Registration and Login

1. Open Settings.
2. Open the Account section.
3. Select Register.
4. Enter first name, last name, email, and password.
5. Register the account.
6. Confirm that the signed-in account summary appears.
7. Refresh the page.
8. Confirm that the session remains active.
9. Sign out.
10. Sign in again using the same email and password.

Use Prisma Studio to verify records in:

- `users`
- `accounts`
- `sessions`
- `profiles`

### 5. Profile Persistence

1. Sign in.
2. Open Settings.
3. Select **Edit** in the Account section.
4. Change the first name, last name, or timezone.
5. Save the profile.
6. Refresh the page.
7. Confirm that the saved values remain visible.
8. Verify the record in the `profiles` table.

### 6. Notifications

Notification APIs require either:

- `localhost`, or
- a secure HTTPS URL.

Testing flow:

1. Sign in.
2. Open Settings.
3. Select **Enable notifications**.
4. Allow notifications in the browser permission dialog.
5. Confirm that a record appears in `push_subscriptions`.
6. Select **Send test notification**.
7. Confirm that the system notification appears.
8. Click the notification.
9. Confirm that the application opens on the Today page.
10. Select **Disable notifications**.
11. Confirm that the subscription is removed from `push_subscriptions`.

If notification permission has previously been blocked, reset it using the browser or operating-system site settings.

### 7. iOS Notification Testing

Requirements:

- iOS 16.4 or newer
- Safari
- Application installed on the Home Screen
- Application opened from the installed Home Screen icon

Steps:

1. Open the application URL in Safari.
2. Select the application’s **Install app** button.
3. Follow the displayed instructions.
4. Use **Share → Add to Home Screen → Add**.
5. Close Safari.
6. Open My Day from its Home Screen icon.
7. Open Settings.
8. Enable notifications.
9. Send a test notification.
10. Confirm that it appears in iOS.

Web notifications may be unavailable when the application is opened only as a normal Safari tab.

### 8. Android and Desktop PWA Installation

On compatible Chromium browsers:

1. Open the application.
2. Select **Install app**.
3. Confirm the browser installation dialog.
4. Launch the installed application.
5. Confirm that it opens in standalone mode.
6. Confirm that the Install button is hidden after installation.

If the browser does not expose a native installation prompt, the application displays platform-specific installation instructions.

### 9. Language and RTL Review

Test all supported languages:

- English
- German
- Persian
- Arabic

Confirm:

- Translated navigation and settings
- Correct LTR/RTL direction
- No text overflow
- Correct calendar defaults
- Correct notification text
- Correct installation instructions

### 10. Dark Mode and Responsive Review

Review:

- Desktop width
- Tablet width
- Mobile width
- Light mode
- Dark mode
- Installed PWA mode

Confirm that forms, modals, dropdowns, cards, navigation, backup controls, profile controls, and notification controls remain readable.

## API Routes

| Route                    | Purpose                                               |
| ------------------------ | ----------------------------------------------------- |
| `/api/auth/[...all]`     | Better Auth authentication endpoints                  |
| `/api/profile`           | Read and update the signed-in user profile            |
| `/api/db-check`          | Development-only database connection check            |
| `/api/push/subscription` | Create or delete a signed-in user’s Push subscription |
| `/api/push/test`         | Send a test Push notification                         |

Profile and Push routes require an authenticated session.

## Security Notes

- Never commit `.env`.
- Never expose `BETTER_AUTH_SECRET`.
- Never expose `VAPID_PRIVATE_KEY`.
- Do not log complete Push endpoints or subscription keys.
- Passwords are hashed and cannot be recovered from the database.
- Production must use HTTPS.
- Production must use a stable `BETTER_AUTH_URL`.
- Production trusted origins must contain only real application origins.
- Do not keep temporary Codespaces origins in production configuration.

## Final Review Commands

Run these commands before submitting the branch:

```bash
npm install
npx prisma validate
npx prisma generate
npx prisma migrate status
npm run build
git diff --check
git status --short
```

There is currently no automated test suite configured, so the application must also be reviewed using the manual test guide above.

## Current Limitations

The following items are intentionally not completed yet:

- Email verification delivery
- Forgot-password email delivery
- SMTP integration
- Planner synchronization between devices
- Scheduled task and routine reminders
- App Store and Google Play packaging
- Automated tests
- Production deployment configuration

## Planned Improvements

- Email verification and password recovery
- Account-based planner synchronization
- Scheduled reminders
- Automated unit and integration tests
- GitHub Actions CI/CD
- Production hosting
- App Store and Google Play distribution

## Data and Privacy

Tasks, routines, preferences, and local backups are stored on the user’s device in IndexedDB.

Account, profile, session, and Push-subscription records are stored in MySQL only when the user chooses to register and sign in.

Planner data is not currently uploaded to the account database.

Users should download JSON backups regularly. Clearing browser storage, uninstalling the application, or losing the device may remove local planner data when no backup is available.

## Development Branch

Profile, authentication, notifications, and PWA installation changes are developed on:

```text
feature/profile-notifications
```

## Firewall error in Codespaces, Error: P1001: Can't reach database server at `db:3306`

DAPL_BRIDGE="br-$(docker network inspect dapl-dev_default --format '{{.Id}}' | cut -c1-12)"

sudo iptables-legacy -C FORWARD \
  -i "$DAPL_BRIDGE" -o "$DAPL_BRIDGE" -j ACCEPT \
  || sudo iptables-legacy -I FORWARD 1 \
  -i "$DAPL_BRIDGE" -o "$DAPL_BRIDGE" -j ACCEPT


##
DAPL_NETWORK_ID=$(docker network inspect dapl-production_default --format '{{.Id}}')
DAPL_BRIDGE="br-${DAPL_NETWORK_ID:0:12}"

sudo iptables-legacy -C DOCKER-USER \
  -i "$DAPL_BRIDGE" -o "$DAPL_BRIDGE" -j ACCEPT \
  || sudo iptables-legacy -I DOCKER-USER 1 \
  -i "$DAPL_BRIDGE" -o "$DAPL_BRIDGE" -j ACCEPT

  ## Migration databank
  docker compose --env-file .env.production -f compose.production.yaml run --rm --pull never app npx prisma migrate deploy --config prisma7.config.ts