import { Request, Response, NextFunction } from 'express'
import { getGigaChatService } from '../services/gigachat.service.js'

export const chatController = {
  async sendMessage(req: Request, res: Response, next: NextFunction) {
    try {
      const { message } = req.body

      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Поле message обязательно и должно быть строкой',
        })
      }

      if (message.trim().length === 0) {
        return res.status(400).json({
          error: 'Invalid request',
          message: 'Сообщение не может быть пустым',
        })
      }

      const service = getGigaChatService()
      const response = await service.sendMessage(message)

      return res.json({
        success: true,
        response,
      })
    } catch (error) {
      next(error)
    }
  },
}
