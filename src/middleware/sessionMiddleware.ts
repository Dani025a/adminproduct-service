import session from 'express-session';
import app from '../app';

app.use(session({
  secret: 'your-secret',
  resave: false,
  saveUninitialized: true,
}));
