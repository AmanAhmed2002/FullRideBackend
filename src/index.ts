import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/authRoutes'
import profileRoutes from './routes/profileRoutes'
import eventRoutes from './routes/eventRoutes'
import rideRoutes  from './routes/rideRoutes'
import geocodeRoutes from './routes/geocodeRoutes'
import safeSpotsRoutes from './routes/safeSpotsRoutes'


dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.use('/auth', authRoutes)
app.use('/profiles', profileRoutes)
app.use('/events',   eventRoutes)
app.use('/rides',    rideRoutes)
app.use('/geocode', geocodeRoutes)
app.use('/safe-spots', safeSpotsRoutes)


app.get('/health', (_req, res, _next) => {
  res.send('OK')
})

//const PORT = process.env.PORT || 4000
const PORT = process.env.PORT 
  ? Number(process.env.PORT) 
  : 4000

app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`)
})

