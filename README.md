# TAQ Portfolio Backend

This is the backend Node.js/Express server for the TAQ Portfolio project.

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
Create a `.env` file with:
```env
DATABASE_URL=your_database_url
SESSION_SECRET=your_session_secret
SENDGRID_API_KEY=your_sendgrid_key
PORT=3000
```

3. Start development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
```

5. Start production server:
```bash
npm start
```

## Database

This project uses Drizzle ORM with PostgreSQL. To update the database schema:

```bash
npm run db:push
```

## Deployment

### Deploying to Render

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Connect your GitHub repository
4. Configure:
   - Environment: Node
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
5. Add environment variables in Render dashboard
6. Deploy!

### Deploying to Heroku

1. Install Heroku CLI
2. Login to Heroku:
```bash
heroku login
```

3. Create a new Heroku app:
```bash
heroku create your-app-name
```

4. Add PostgreSQL addon:
```bash
heroku addons:create heroku-postgresql:hobby-dev
```

5. Configure environment variables:
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your_session_secret
heroku config:set SENDGRID_API_KEY=your_sendgrid_key
```

6. Deploy:
```bash
git push heroku main
```

## Development

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run db:push` - Update database schema 