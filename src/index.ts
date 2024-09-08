import { Hono } from 'hono'
import { dataViewer, webhookHandler } from './middleware';

type Bindings = {
  DISCORD_WEBHOOK_URL : string,
  data : string
};

const app = new Hono<{Bindings : Bindings}>()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get("/data", ...dataViewer);
app.post('/webhook', ...webhookHandler)

export default app
