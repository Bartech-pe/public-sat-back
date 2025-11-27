import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { InternalServerErrorException } from '@nestjs/common';
import { audiobaseConfig } from 'config/env';
import { Response } from 'express';

import * as https from 'https';
const agent = new https.Agent({
  rejectUnauthorized: false, // ignora la validación SSL (solo desarrollo)
});

@Injectable()
export class TtsService {
  async create(body: { text: string }, res: Response): Promise<any> {
    try {
      const formData = new URLSearchParams({
        text: body.text,
      });

      const result = await axios.post(
        `${audiobaseConfig.url}/tts`,
        formData.toString(),
        {
          httpsAgent: agent,
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          responseType: 'arraybuffer',
        },
      );

      res.setHeader('Content-Type', 'audio/wav');
      res.send(result.data);
    } catch (error) {
      console.error(
        `Error al generar el audio: ${error.response?.data || error.message}`,
      );
      throw new InternalServerErrorException(
        error.response?.data || error.message,
      );
    }
  }
}
