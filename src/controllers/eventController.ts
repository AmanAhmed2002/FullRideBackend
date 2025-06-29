import { Request, Response } from 'express'
import { getOrCreateEvent, listEvents, createEvent } from '../services/eventService'

export async function upsertEventHandler(req: Request, res: Response) {
  try {
    const input = { name: req.body.name, address: req.body.address }
    const event = await getOrCreateEvent(input)
    res.json(event)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function createEventHandler(req: Request, res: Response) {
  try {
    const input = { name: req.body.name, address: req.body.address }
    const event = await createEvent(input)
    res.json(event)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}

export async function listEventsHandler(req: Request, res: Response) {
  try {
    const events = await listEvents()
    res.json(events)
  } catch (err: any) {
    res.status(500).json({ error: err.message })
  }
}
