test

#### Install PHP dependencies:

```bash
composer update
```

```bash
composer install
```

_If you don't have Composer installed, [instructions here](https://getcomposer.org/)._

#### Generate an app key:

```bash
php artisan key:generate
```

#### Generate JWT keys for the .env file:

```bash
php artisan jwt:secret
```

#### Run the database migrations:

```bash
php artisan migrate
```

#### Install Javascript dependencies:

```bash
npm install
```

_If you don't have Node and NPM installed, [instructions here](https://www.npmjs.com/get-npm)._

#### Run an initial build:

```bash
npm run dev
```

```bash
php artisan serve
```

### Additional Set Up Tips

#### Database Seeding

If you need sample data to work with, you can seed the database:

```
php artisan migrate:refresh --seed --force
```

#### Seeded User

After seeding the database, you can log in with these credentials:

Email: `user@test.dev`
Password: `password`
